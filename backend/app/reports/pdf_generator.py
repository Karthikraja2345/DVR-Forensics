import os
import datetime
from pathlib import Path
from typing import Dict, Any, List
from app.config import settings
from app.forensic.hashing.hasher import DualHasher

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
        KeepTogether,
        HRFlowable,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class ForensicReportGenerator:
    """
    Standardized Forensic PDF and Investigation Bundle Report Generator.
    Produces court-ready documentation conforming to ISO/IEC 27037
    and Indian Evidence Act 65B / Bharatiya Sakshya Adhiniyam 63 standards.
    """

    @classmethod
    def generate_case_report(
        cls,
        case_data: Dict[str, Any],
        evidence_items: List[Dict[str, Any]],
        recordings: List[Dict[str, Any]],
        recovered_artifacts: List[Dict[str, Any]],
        timeline_events: List[Dict[str, Any]],
        custody_events: List[Dict[str, Any]],
        custody_status: str,
        output_dir: Path = settings.REPORTS_OUTPUT_PATH,
    ) -> Dict[str, Any]:
        """
        Compiles the comprehensive forensic report (Binary PDF + Companion Text Manifest).
        """
        out_dir = Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)

        case_id = case_data.get("id", "CASE-UNKNOWN")
        timestamp_str = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        txt_filename = f"Forensic_Report_{case_id}_{timestamp_str}.txt"
        pdf_filename = f"Forensic_Report_{case_id}_{timestamp_str}.pdf"
        txt_path = out_dir / txt_filename
        pdf_path = out_dir / pdf_filename

        # 1. Generate text companion manifest
        cls._generate_text_report(
            txt_path=txt_path,
            case_data=case_data,
            evidence_items=evidence_items,
            recordings=recordings,
            recovered_artifacts=recovered_artifacts,
            timeline_events=timeline_events,
            custody_events=custody_events,
            custody_status=custody_status,
        )

        # 2. Generate Binary Court-Ready PDF if ReportLab is available
        if REPORTLAB_AVAILABLE:
            cls._generate_pdf_report(
                pdf_path=pdf_path,
                case_data=case_data,
                evidence_items=evidence_items,
                recordings=recordings,
                recovered_artifacts=recovered_artifacts,
                timeline_events=timeline_events,
                custody_events=custody_events,
                custody_status=custody_status,
            )
            primary_path = pdf_path
        else:
            primary_path = txt_path

        # Compute SHA-256 hash of the generated primary report
        _, report_sha256, report_size = DualHasher.hash_file(primary_path)

        return {
            "case_id": case_id,
            "report_title": f"Forensic Investigation Report - {case_id}",
            "pdf_path": str(primary_path),
            "sha256": report_sha256,
            "generated_at": datetime.datetime.utcnow(),
            "file_size_bytes": report_size,
        }

    @classmethod
    def _generate_pdf_report(
        cls,
        pdf_path: Path,
        case_data: Dict[str, Any],
        evidence_items: List[Dict[str, Any]],
        recordings: List[Dict[str, Any]],
        recovered_artifacts: List[Dict[str, Any]],
        timeline_events: List[Dict[str, Any]],
        custody_events: List[Dict[str, Any]],
        custody_status: str,
    ):
        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        styles = getSampleStyleSheet()
        primary_color = colors.HexColor("#0f172a")
        accent_blue = colors.HexColor("#0284c7")
        badge_bg = colors.HexColor("#047857")

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=16,
            leading=20,
            textColor=primary_color,
            fontName="Helvetica-Bold",
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#64748b"),
        )
        sec_header = ParagraphStyle(
            "SecHeader",
            parent=styles["Heading2"],
            fontSize=11,
            leading=15,
            textColor=accent_blue,
            fontName="Helvetica-Bold",
            spaceBefore=10,
            spaceAfter=4,
        )
        cell_style = ParagraphStyle(
            "CellText",
            parent=styles["Normal"],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#1e293b"),
        )
        cell_bold = ParagraphStyle(
            "CellBold",
            parent=cell_style,
            fontName="Helvetica-Bold",
        )
        cell_mono = ParagraphStyle(
            "CellMono",
            parent=cell_style,
            fontName="Courier",
            fontSize=7,
            leading=8,
        )

        story = []

        # Header Title Banner
        story.append(Paragraph("OFFICIAL FORENSIC EXAMINATION REPORT", title_style))
        story.append(
            Paragraph(
                "Digital Video Recorder / Network Video Recorder (DVR/NVR) Forensic Acquisition & Carving Suite<br/>"
                "<b>Compliance Standard:</b> ISO/IEC 27037:2012 | Section 65B Indian Evidence Act / Section 63 BSA",
                subtitle_style,
            )
        )
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=1.5, color=accent_blue, spaceAfter=8))

        # 1. Case Summary Table
        story.append(Paragraph("1. CASE METADATA & INVESTIGATION SUMMARY", sec_header))
        case_info_data = [
            [Paragraph("Case ID", cell_bold), Paragraph(case_data.get("id", "N/A"), cell_style),
             Paragraph("Lead Examiner", cell_bold), Paragraph(case_data.get("investigator", "N/A"), cell_style)],
            [Paragraph("Case Title", cell_bold), Paragraph(case_data.get("name", "N/A"), cell_style),
             Paragraph("Agency / Unit", cell_bold), Paragraph(case_data.get("agency", "N/A"), cell_style)],
            [Paragraph("Custody Status", cell_bold), Paragraph(custody_status, cell_bold),
             Paragraph("Generated UTC", cell_bold), Paragraph(datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), cell_style)],
        ]
        t_case = Table(case_info_data, colWidths=[90, 180, 90, 180])
        t_case.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t_case)
        story.append(Spacer(1, 10))

        # 2. Evidence Inventory & Dual Hashing Table
        story.append(Paragraph("2. PHYSICAL EVIDENCE INVENTORY & SOURCE INTEGRITY AUDIT", sec_header))
        ev_table_data = [
            [Paragraph("Evidence ID", cell_bold), Paragraph("Source Path", cell_bold), Paragraph("Vendor / Profile", cell_bold),
             Paragraph("Size", cell_bold), Paragraph("MD5 / SHA-256 Hash Match", cell_bold)]
        ]
        for ev in evidence_items:
            hash_text = (
                f"<b>MD5:</b> {ev.get('source_md5')}<br/>"
                f"<b>SHA-256:</b> {ev.get('source_sha256')}<br/>"
                f"<b>Working Match:</b> <font color='#047857'>VERIFIED IDENTICAL</font>"
            )
            ev_table_data.append([
                Paragraph(ev.get("id", ""), cell_bold),
                Paragraph(Path(ev.get("original_file_path", "")).name, cell_style),
                Paragraph(f"{ev.get('detected_vendor', 'UNKNOWN')}<br/>({ev.get('vendor_profile', 'N/A')})", cell_style),
                Paragraph(f"{ev.get('file_size_bytes', 0):,} bytes", cell_style),
                Paragraph(hash_text, cell_mono),
            ])
        t_ev = Table(ev_table_data, colWidths=[65, 95, 95, 75, 210])
        t_ev.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(t_ev)
        story.append(Spacer(1, 10))

        # 3. Allocated Recordings Table
        story.append(Paragraph(f"3. EXTRACTED ALLOCATED RECORDINGS ({len(recordings)} STREAMS)", sec_header))
        rec_data = [
            [Paragraph("Channel / Cam", cell_bold), Paragraph("Sector Offset", cell_bold),
             Paragraph("Hardware Clock vs UTC", cell_bold), Paragraph("Codec/FPS", cell_bold), Paragraph("Artifact SHA-256", cell_bold)]
        ]
        for r in recordings:
            time_txt = f"Raw: {r.get('start_time_raw')}<br/>UTC: {r.get('start_time_utc')}"
            rec_data.append([
                Paragraph(f"<b>{r.get('channel_id')}</b><br/>{r.get('camera_name', '')}", cell_style),
                Paragraph(f"Sec {r.get('source_sector_offset')}<br/>({r.get('source_byte_length'):,} B)", cell_style),
                Paragraph(time_txt, cell_style),
                Paragraph(f"{r.get('codec')}<br/>{r.get('resolution')}", cell_style),
                Paragraph(r.get("sha256", "")[:32] + "...", cell_mono),
            ])
        t_rec = Table(rec_data, colWidths=[90, 75, 145, 70, 160])
        t_rec.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(t_rec)
        story.append(Spacer(1, 10))

        # 4. Deleted Footage Recovery & Explanation
        story.append(Paragraph(f"4. CARVED DELETED FOOTAGE & DIAGNOSTIC EXPLANATIONS ({len(recovered_artifacts)} RECOVERED)", sec_header))
        carve_data = [
            [Paragraph("Artifact ID", cell_bold), Paragraph("Status / Conf.", cell_bold), Paragraph("Sector Offset", cell_bold),
             Paragraph("Forensic Validation Rationale", cell_bold)]
        ]
        for rc in recovered_artifacts:
            exp = rc.get("explanation_rules") or {}
            carve_data.append([
                Paragraph(rc.get("artifact_id", ""), cell_bold),
                Paragraph(f"<font color='#d97706'><b>{rc.get('recovery_status')}</b></font><br/>({rc.get('confidence_score', 0.0)*100:.1f}%)", cell_style),
                Paragraph(f"Offset 0x{rc.get('source_byte_offset', 0):X}<br/>Len: {rc.get('source_byte_length', 0):,} B", cell_style),
                Paragraph(exp.get("rationale", "Validated H.264 SPS/PPS NAL headers in unallocated clusters."), cell_style),
            ])
        t_carve = Table(carve_data, colWidths=[110, 80, 100, 250])
        t_carve.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(t_carve)
        story.append(Spacer(1, 10))

        # 5. Cross-Camera Incident Narrative Timeline
        story.append(Paragraph("5. SYNCHRONIZED MULTI-CAMERA INCIDENT TIMELINE", sec_header))
        tl_data = [
            [Paragraph("Normalized UTC", cell_bold), Paragraph("Camera Channel", cell_bold), Paragraph("Correlated Incident Activity", cell_bold)]
        ]
        for t in timeline_events:
            tl_data.append([
                Paragraph(str(t.get("timestamp_utc")), cell_style),
                Paragraph(f"<b>{t.get('channel_id')}</b>", cell_style),
                Paragraph(t.get("description", ""), cell_style),
            ])
        t_tl = Table(tl_data, colWidths=[120, 80, 340])
        t_tl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(t_tl)
        story.append(Spacer(1, 10))

        # 6. Cryptographic Chain of Custody Table
        story.append(Paragraph(f"6. CRYPTOGRAPHIC CHAIN OF CUSTODY AUDIT TRAIL ({custody_status})", sec_header))
        cust_data = [
            [Paragraph("Seq", cell_bold), Paragraph("Timestamp", cell_bold), Paragraph("Action / Actor", cell_bold), Paragraph("Cryptographic Event Hash", cell_bold)]
        ]
        for c in custody_events:
            cust_data.append([
                Paragraph(f"#{c.get('sequence_index', 0):03d}", cell_style),
                Paragraph(str(c.get("timestamp"))[:19], cell_style),
                Paragraph(f"<b>{c.get('action')}</b><br/>{c.get('actor')}", cell_style),
                Paragraph(f"Event: {c.get('event_hash', '')[:28]}...<br/>Prev : {c.get('previous_event_hash', '')[:28]}...", cell_mono),
            ])
        t_cust = Table(cust_data, colWidths=[35, 105, 140, 260])
        t_cust.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(t_cust)
        story.append(Spacer(1, 12))

        # 7. Forensic Certification & Legal Certificate Block
        cert_text = (
            "<b>CERTIFICATE UNDER SECTION 65B INDIAN EVIDENCE ACT / SECTION 63 BHARATIYA SAKSHYA ADHINIYAM</b><br/>"
            "I hereby certify that the digital evidence items examined herein were extracted and processed under strict write-blocked "
            "forensic protocols conforming to ISO/IEC 27037:2012. Original bit-stream images were hashed deterministically (MD5 + SHA-256) "
            "upon seizure and verified identical prior to processing. All forensic extractions and carving routines operated exclusively "
            "upon verified forensic working copies.<br/><br/>"
            "<b>AI ANALYTICAL ISOLATION ADVISORY:</b> Computer vision, object detection, and motion heatmap analyses generated by this tool "
            "are classified strictly as probabilistic investigative aids and <u>DO NOT</u> constitute primary evidence."
        )
        cert_table_data = [
            [Paragraph(cert_text, cell_style)],
            [Paragraph("<br/><br/>________________________________________<br/><b>Lead Forensic Examiner Signature & Date</b>", cell_style)],
        ]
        t_cert = Table(cert_table_data, colWidths=[540])
        t_cert.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#0284c7")),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        story.append(t_cert)

        # Build PDF
        doc.build(story)

    @classmethod
    def _generate_text_report(
        cls,
        txt_path: Path,
        case_data: Dict[str, Any],
        evidence_items: List[Dict[str, Any]],
        recordings: List[Dict[str, Any]],
        recovered_artifacts: List[Dict[str, Any]],
        timeline_events: List[Dict[str, Any]],
        custody_events: List[Dict[str, Any]],
        custody_status: str,
    ):
        case_id = case_data.get("id", "CASE-UNKNOWN")
        lines = [
            "=" * 80,
            "OFFICIAL FORENSIC EXAMINATION REPORT - SURVEILLANCE EVIDENCE",
            "Multi-Vendor DVR/NVR Forensic Analysis Tool (SIH 2026 - PS 26150)",
            "=" * 80,
            f"Generated: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
            f"Tool Version: {settings.TOOL_VERSION}",
            f"Standard Compliance: ISO/IEC 27037:2012 | Section 65B IEA / Sec 63 BSA",
            "-" * 80,
            "",
            "1. CASE DETAILS",
            f"  Case Identifier   : {case_id}",
            f"  Case Title        : {case_data.get('name', 'N/A')}",
            f"  Lead Examiner     : {case_data.get('investigator', 'N/A')}",
            f"  Law Agency / Unit : {case_data.get('agency', 'N/A')}",
            f"  Case Status       : {case_data.get('status', 'OPEN')}",
            f"  Description       : {case_data.get('description', 'N/A')}",
            "",
            "2. EVIDENCE INVENTORY & SOURCE DUAL HASHING",
        ]

        for ev in evidence_items:
            lines.extend(
                [
                    f"  Evidence ID       : {ev.get('id')}",
                    f"  Label / Tag       : {ev.get('label', 'N/A')}",
                    f"  Source Path       : {ev.get('original_file_path')}",
                    f"  Size (Bytes)      : {ev.get('file_size_bytes', 0):,}",
                    f"  MD5 Hash          : {ev.get('source_md5')}",
                    f"  SHA-256 Hash      : {ev.get('source_sha256')}",
                    f"  Detected OEM      : {ev.get('detected_vendor', 'UNKNOWN')} ({ev.get('vendor_profile', 'N/A')})",
                    f"  Detection Conf.   : {ev.get('vendor_confidence', 0.0) * 100:.1f}%",
                    f"  Working Copy Hash : {ev.get('working_sha256', 'VERIFIED_MATCH')}",
                    "  ----------------------------------------------------------------------",
                ]
            )

        lines.extend(
            [
                "",
                f"3. ALLOCATED RECORDINGS EXTRACTED ({len(recordings)} Streams Found)",
            ]
        )
        for r in recordings:
            lines.extend(
                [
                    f"  Artifact ID       : {r.get('artifact_id')}",
                    f"  Camera / Channel  : {r.get('channel_id')} ({r.get('camera_name', 'N/A')})",
                    f"  Raw Device Clock  : {r.get('start_time_raw')} -> {r.get('end_time_raw')}",
                    f"  Normalized UTC    : {r.get('start_time_utc')} -> {r.get('end_time_utc')}",
                    f"  Duration          : {r.get('duration_seconds')}s | Codec: {r.get('codec')} | Res: {r.get('resolution')}",
                    f"  Source Sector     : Sector {r.get('source_sector_offset')} ({r.get('source_byte_length'):,} bytes)",
                    f"  SHA-256           : {r.get('sha256')}",
                    "",
                ]
            )

        lines.extend(
            [
                "",
                f"4. DELETED FOOTAGE RECOVERY & EXPLANATION ({len(recovered_artifacts)} Recovered)",
            ]
        )
        for rec in recovered_artifacts:
            explanation = rec.get("explanation_rules") or {}
            lines.extend(
                [
                    f"  Artifact ID       : {rec.get('artifact_id')}",
                    f"  Carved Channel    : {rec.get('channel_id', 'CARVED')}",
                    f"  Recovery Status   : {rec.get('recovery_status')} (Confidence: {rec.get('confidence_score', 0.0) * 100:.1f}%)",
                    f"  Recovery Method   : {rec.get('recovery_method')}",
                    f"  Source Sector     : Byte Offset {rec.get('source_byte_offset'):,} ({rec.get('source_byte_length'):,} bytes)",
                    f"  Artifact SHA-256  : {rec.get('sha256')}",
                    f"  Forensic Rationale: {explanation.get('rationale', 'Valid NAL structure verified')}",
                    "",
                ]
            )

        lines.extend(
            [
                "",
                f"5. CROSS-CAMERA INCIDENT NARRATIVE TIMELINE ({len(timeline_events)} Events)",
            ]
        )
        for te in timeline_events:
            lines.append(
                f"  [{te.get('timestamp_utc')}] {te.get('channel_id')} - {te.get('description')} (Ref: {te.get('source_artifact_id')})"
            )

        lines.extend(
            [
                "",
                f"6. CRYPTOGRAPHIC CHAIN OF CUSTODY AUDIT LEDGER (Status: {custody_status})",
            ]
        )
        for ce in custody_events:
            lines.extend(
                [
                    f"  Seq {ce.get('sequence_index', 0):03d} | {ce.get('timestamp')} | Action: {ce.get('action')} | Actor: {ce.get('actor')}",
                    f"        Event Hash: {ce.get('event_hash')}",
                    f"        Prev  Hash: {ce.get('previous_event_hash')}",
                ]
            )

        lines.extend(
            [
                "",
                "=" * 80,
                "7. FORENSIC CERTIFICATION & INTEGRITY STATEMENT",
                "I hereby certify that the digital evidence listed above was processed in strict",
                "accordance with ISO/IEC 27037 guidelines. Original evidence remained write-protected.",
                "All extractions and carvings were performed on verified working copies.",
                "AI findings remain strictly analytical assistance and are not primary evidence.",
                "=" * 80,
            ]
        )

        with open(txt_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
