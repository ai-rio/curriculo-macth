#!/usr/bin/env python3
"""Generate a test PDF file for resume upload testing."""

import sys

from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def create_test_pdf(filename="/tmp/test-resume.pdf"):
    """Create a simple test resume PDF."""
    doc = SimpleDocTemplate(filename, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = styles["Title"]
    title_style.alignment = TA_CENTER
    story.append(Paragraph("JOHN DOE", title_style))
    story.append(Spacer(1, 12))

    # Contact info
    contact_style = styles["Normal"]
    contact_style.alignment = TA_CENTER
    story.append(Paragraph("Software Engineer | john.doe@example.com | (555) 123-4567", contact_style))
    story.append(Spacer(1, 20))

    # Summary
    heading_style = styles["Heading2"]
    story.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
    story.append(Spacer(1, 6))

    normal_style = styles["Normal"]
    summary_text = """
    Experienced software engineer with 5+ years of expertise in full-stack development,
    cloud technologies, and team leadership. Proven track record of delivering high-quality
    solutions and mentoring junior developers.
    """
    story.append(Paragraph(summary_text, normal_style))
    story.append(Spacer(1, 12))

    # Skills
    story.append(Paragraph("TECHNICAL SKILLS", heading_style))
    story.append(Spacer(1, 6))

    skills_text = """
    <b>Languages:</b> JavaScript, TypeScript, Python, HTML5, CSS3<br/>
    <b>Frameworks:</b> React, Node.js, Express, FastAPI, Django<br/>
    <b>Cloud:</b> AWS, Docker, Kubernetes, Azure<br/>
    <b>Databases:</b> PostgreSQL, MongoDB, Redis<br/>
    <b>Tools:</b> Git, CI/CD, JIRA, Agile methodologies
    """
    story.append(Paragraph(skills_text, normal_style))
    story.append(Spacer(1, 12))

    # Experience
    story.append(Paragraph("PROFESSIONAL EXPERIENCE", heading_style))
    story.append(Spacer(1, 6))

    exp1_text = """
    <b>Senior Software Engineer</b> - Tech Corp | 2020-Present<br/>
    • Led development of microservices architecture serving 1M+ users<br/>
    • Improved system performance by 40% through optimization<br/>
    • Mentored team of 5 junior developers<br/>
    • Implemented CI/CD pipelines reducing deployment time by 60%
    """
    story.append(Paragraph(exp1_text, normal_style))
    story.append(Spacer(1, 8))

    exp2_text = """
    <b>Software Engineer</b> - StartupXYZ | 2018-2020<br/>
    • Developed RESTful APIs using Node.js and Express<br/>
    • Built responsive web applications with React<br/>
    • Collaborated with cross-functional teams using Agile<br/>
    • Participated in code reviews and testing procedures
    """
    story.append(Paragraph(exp2_text, normal_style))
    story.append(Spacer(1, 12))

    # Education
    story.append(Paragraph("EDUCATION", heading_style))
    story.append(Spacer(1, 6))

    edu_text = """
    <b>Bachelor of Science in Computer Science</b><br/>
    University of Technology | 2014-2018<br/>
    GPA: 3.8/4.0 | Dean's List
    """
    story.append(Paragraph(edu_text, normal_style))

    # Build the PDF
    doc.build(story)
    print(f"Test PDF created: {filename}")
    return filename


if __name__ == "__main__":
    try:
        create_test_pdf()
        print("PDF generation successful!")
    except Exception as e:
        print(f"Error creating PDF: {e}")
        sys.exit(1)
