# -*- coding: utf-8 -*-
"""
Generador del documento Word (.docx):
EcoLogCity_Plan_Exposicion_Roles_Rutas_Git.docx
Enfocado exclusivamente en el Sprint 1 (sin documentación previa ya evaluada como Jira / Acta).
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_border(cell, **kwargs):
    """
    kwargs can be top, bottom, left, right.
    values like: {"val": "single", "sz": "12", "color": "CBD5E1"}
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for edge in ('top', 'left', 'bottom', 'right'):
        edge_data = kwargs.get(edge)
        edge_el = OxmlElement(f'w:{edge}')
        if edge_data:
            edge_el.set(qn('w:val'), edge_data.get('val', 'single'))
            edge_el.set(qn('w:sz'), str(edge_data.get('sz', '4')))
            edge_el.set(qn('w:space'), '0')
            edge_el.set(qn('w:color'), edge_data.get('color', 'CBD5E1'))
        else:
            edge_el.set(qn('w:val'), 'none')
        tcBorders.append(edge_el)
    tcPr.append(tcBorders)

def add_callout(doc, text_paragraphs, border_color="1E6F5C", bg_color="F8FAFC", title=None):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=180)
    
    # Left border only (thick)
    set_cell_border(cell, 
                    left={"val": "single", "sz": "24", "color": border_color},
                    top={"val": "none"}, right={"val": "none"}, bottom={"val": "none"})
    
    first = True
    p0 = cell.paragraphs[0]
    p0.paragraph_format.space_before = Pt(0)
    p0.paragraph_format.space_after = Pt(2)
    p0.paragraph_format.line_spacing = 1.15
    
    if title:
        run_t = p0.add_run(f"📌 {title}\n")
        run_t.font.name = "Arial"
        run_t.font.size = Pt(10.5)
        run_t.font.bold = True
        run_t.font.color.rgb = RGBColor(15, 44, 89)
    
    for idx, tp in enumerate(text_paragraphs):
        if first and not title:
            p = p0
            first = False
        elif first and title:
            p = p0
            first = False
        else:
            p = cell.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
        
        run = p.add_run(tp)
        run.font.name = "Arial"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(45, 55, 72)
    
    post_p = doc.add_paragraph()
    post_p.paragraph_format.space_before = Pt(0)
    post_p.paragraph_format.space_after = Pt(4)

def format_table(tbl, col_widths=None, header_bg="0F2C59", alt_bg="F8FAFC", border_color="CBD5E1"):
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    for i, row in enumerate(tbl.rows):
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        if i == 0:
            trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        
        for j, cell in enumerate(row.cells):
            if col_widths and j < len(col_widths):
                cell.width = Inches(col_widths[j])
            
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            
            set_cell_border(cell,
                            top={"val": "single", "sz": "4", "color": border_color},
                            bottom={"val": "single", "sz": "4", "color": border_color},
                            left={"val": "single", "sz": "4", "color": border_color},
                            right={"val": "single", "sz": "4", "color": border_color})
            
            if i == 0:
                set_cell_background(cell, header_bg)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(0)
                    p.paragraph_format.space_after = Pt(0)
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    for r in p.runs:
                        r.font.name = "Arial"
                        r.font.size = Pt(9.5)
                        r.font.bold = True
                        r.font.color.rgb = RGBColor(255, 255, 255)
            else:
                if i % 2 == 1:
                    set_cell_background(cell, "FFFFFF")
                else:
                    set_cell_background(cell, alt_bg)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(0)
                    p.paragraph_format.space_after = Pt(0)
                    p.paragraph_format.line_spacing = 1.15
                    for r in p.runs:
                        r.font.name = "Arial"
                        r.font.size = Pt(9)
                        r.font.color.rgb = RGBColor(45, 55, 72)

def add_code_block(doc, code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "F1F5F9")
    set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
    set_cell_border(cell,
                    left={"val": "single", "sz": "18", "color": "475569"},
                    top={"val": "single", "sz": "4", "color": "E2E8F0"},
                    right={"val": "single", "sz": "4", "color": "E2E8F0"},
                    bottom={"val": "single", "sz": "4", "color": "E2E8F0"})
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.1
    run = p.add_run(code_text)
    run.font.name = "Consolas"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(15, 23, 42)
    
    post_p = doc.add_paragraph()
    post_p.paragraph_format.space_before = Pt(0)
    post_p.paragraph_format.space_after = Pt(3)

def create_document():
    doc = docx.Document()
    
    # Page setup - Margins 0.9 inch
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.9)
        section.bottom_margin = Inches(0.9)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)
        
        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("EcoLogCity · Plan de Exposición Técnica: Incremento del Sprint 1")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8)
        hrun.font.color.rgb = RGBColor(140, 150, 165)
        
        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("DistriRápido S.A.C. · Defensa Técnica Sprint 1: Arquitectura, PostGIS, Calidad y Geocodificación")
        frun.font.name = "Arial"
        frun.font.size = Pt(8)
        frun.font.color.rgb = RGBColor(140, 150, 165)

    # TITULO Y ENCABEZADO
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_t = title_p.add_run("EcoLogCity — Plan de Exposición Técnica: Sprint 1")
    run_t.font.name = "Arial"
    run_t.font.size = Pt(22)
    run_t.font.bold = True
    run_t.font.color.rgb = RGBColor(15, 44, 89) # Navy
    
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(12)
    run_sub = sub_p.add_run("Distribución Tripartita de Rutas Git, Roles de Desarrollo y Guion de Defensa (Exclusivo Sprint 1)")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(12)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(30, 111, 92) # Teal

    # METADATOS EN TABLA
    meta_table = doc.add_table(rows=6, cols=2)
    meta_data = [
        ("Proyecto / Sistema", "EcoLogCity (Optimizador VRPTW & Green VRP para Distribución Urbana)"),
        ("Empresa Patrocinadora", "DistriRápido S.A.C. · Huancayo, Junín (3,250 msnm)"),
        ("Alcance de la Defensa", "Exclusivo Sprint 1 (Incremento de Software, Arquitectura y Calidad en Git — Documentación previa de Inicio y Jira ya evaluada)"),
        ("Metodología & Calidad", "Scrum + Git Flow · Definition of Done (DoD >= 80%) · ISO 14083"),
        ("Estado de Implementación", "Sprint 1 Finalizado al 100% · Cobertura DoD: 87.83% · PostgreSQL + PostGIS Activo"),
        ("Modalidad de Exposición", "Defensa Técnica Tripartita (3 Integrantes) · Tiempo estimado total: 24 - 27 min")
    ]
    for idx, (k, v) in enumerate(meta_data):
        row = meta_table.rows[idx]
        cell_k, cell_v = row.cells[0], row.cells[1]
        
        pk = cell_k.paragraphs[0]
        pk.paragraph_format.space_before = Pt(0)
        pk.paragraph_format.space_after = Pt(0)
        rk = pk.add_run(k)
        rk.font.name = "Arial"
        rk.font.bold = True
        rk.font.size = Pt(9)
        rk.font.color.rgb = RGBColor(15, 44, 89)
        
        pv = cell_v.paragraphs[0]
        pv.paragraph_format.space_before = Pt(0)
        pv.paragraph_format.space_after = Pt(0)
        rv = pv.add_run(v)
        rv.font.name = "Arial"
        rv.font.size = Pt(9)
        rv.font.color.rgb = RGBColor(45, 55, 72)
    
    format_table(meta_table, col_widths=[2.1, 4.6], header_bg="E2E8F0", alt_bg="F8FAFC", border_color="CBD5E1")
    for cell in meta_table.rows[0].cells:
        set_cell_background(cell, "EBF3FA")
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.color.rgb = RGBColor(15, 44, 89)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 1. MATRIZ MAESTRA
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    rh1 = h1.add_run("1. Matriz Maestra de Roles y Distribución de Tiempos (Sprint 1)")
    rh1.font.name = "Arial"
    rh1.font.size = Pt(15)
    rh1.font.bold = True
    rh1.font.color.rgb = RGBColor(15, 44, 89)

    intro_p1 = doc.add_paragraph()
    intro_p1.paragraph_format.space_after = Pt(8)
    intro_p1.paragraph_format.line_spacing = 1.15
    r_intro = intro_p1.add_run(
        "Para garantizar una sustentación académica y técnica sólida, estructurada y equilibrada ante el jurado evaluador, "
        "la defensa se concentra exclusivamente en el Incremento Técnico y Calidad de Código del Sprint 1. "
        "Dado que la documentación inicial del proyecto (Acta de Constitución, Matriz de Interesados y configuración de Jira) "
        "ya fue expuesta y calificada previamente, cada integrante defiende de manera directa las rutas de código, pruebas, "
        "artefactos de configuración y comandos de Git que implementó en este Sprint 1:"
    )
    r_intro.font.name = "Arial"
    r_intro.font.size = Pt(9.5)
    r_intro.font.color.rgb = RGBColor(45, 55, 72)

    master_table = doc.add_table(rows=4, cols=5)
    headers = ["Expositor", "Rol Oficial en el Sprint 1", "Rutas Git Clave Asignadas", "Demostración Práctica", "Tiempo"]
    for j, h in enumerate(headers):
        master_table.rows[0].cells[j].paragraphs[0].text = h

    matrix_rows = [
        (
            "1. Albornoz Peña\nJeferson Bener",
            "Líder Técnico & Scrum Master\nDirector del Proyecto (PM)",
            "• README.md\n• .gitignore, .env.example\n• Guion_Exposicion_Mejorado.md\n• Consola Git (status, branch, log)",
            "Presentación del Sprint 1 Goal, alcance de Historias de Usuario (EP-01, US-001, EN-001), cumplimiento del Definition of Done (DoD >= 80%), gobernanza de Git Flow y trazabilidad de commits.",
            "7 - 8 min"
        ),
        (
            "2. Landa Rojas\nAlexander Nelson",
            "Arquitecto Backend & DevOps\nQA Engineer",
            "• database/migrations/\n  (001_init_postgis_schema.sql)\n• database/seeds/\n• backend/src/config/db.js\n• backend/src/server.js, app.js\n• backend/src/routes/api.js\n• backend/src/controllers/pedidoController.js\n• backend/src/services/pedidoService.js\n• backend/tests/ (pedidos, endpoints)\n• docker-compose.yml, .github/workflows/",
            "Explicación del modelo PostGIS con restricciones de ventana horaria, endpoints CRUD, ejecución en vivo en terminal de 'npm run test:coverage' (87.83% DoD) y pipeline CI/CD automatizado.",
            "8 - 9 min"
        ),
        (
            "3. Quispe Aquino\nJunior",
            "Frontend Developer / UX/UI\nEspecialista en Geocodificación / Motor VRP",
            "• backend/src/services/geocodingService.js\n• backend/src/controllers/geocodingController.js\n• backend/tests/geocoding.test.js\n• frontend/public/index.html\n• frontend/public/app.js\n• frontend/package.json",
            "Demostración en vivo en navegador (http://localhost:8000), geocodificación automática en Huancayo, ajuste manual con marcador Drag & Drop en Leaflet, actualización de KPIs en tiempo real y preparación de insumos para el motor VRP de Sprint 2.",
            "8 - 9 min"
        )
    ]

    for i, data in enumerate(matrix_rows):
        row = master_table.rows[i+1]
        for j, text in enumerate(data):
            cell = row.cells[j]
            cell.paragraphs[0].text = text

    format_table(master_table, col_widths=[1.3, 1.4, 1.8, 1.6, 0.6], header_bg="0F2C59", alt_bg="F8FAFC", border_color="CBD5E1")

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_callout(doc, [
        "Estrategia de Transición Fluida entre Expositores del Sprint 1:",
        "1. Jeferson (Líder Técnico): Define el Sprint 1 Goal, el DoD alcanzado y la salud del repositorio Git -> Da pase a Alexander para la arquitectura y calidad técnica backend.",
        "2. Alexander (Backend/QA): Demuestra la base de datos PostGIS, la API REST y la cobertura de pruebas del 87.83% en consola -> Da pase a Junior para la experiencia interactiva en navegador.",
        "3. Junior (Frontend/Geocoding): Demuestra la aplicación web en vivo en Huancayo, la georreferenciación y los insumos listos para el motor VRP del Sprint 2 -> Abre la ronda de preguntas técnicas."
    ], border_color="1E6F5C", bg_color="F0FDF4", title="Regla de Oro para la Transición entre Bloques")

    # =========================================================================
    # PARTE 1 - JEFERSON ALBORNOZ
    # =========================================================================
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(4)
    rh1 = h1.add_run("2. Parte 1 — Gestión del Sprint 1, Gobernanza Git y Calidad Técnica")
    rh1.font.name = "Arial"
    rh1.font.size = Pt(15)
    rh1.font.bold = True
    rh1.font.color.rgb = RGBColor(15, 44, 89)

    doc.add_paragraph()
    meta_p1 = [
        "Expositor Asignado: Albornoz Peña Jeferson Bener",
        "Rol Oficial en el Sprint: Líder Técnico & Scrum Master / Director del Proyecto (PM)",
        "Tiempo Asignado: 7 a 8 minutos (Apertura de la Defensa Técnica del Sprint 1)",
        "Enfoque de Defensa: Sprint 1 Goal, Desglose del Sprint Backlog (EP-01, US-001, EN-001), Definition of Done (DoD), Estructura del Repositorio y Git Flow"
    ]
    for mp in meta_p1:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)
        k, v = mp.split(":", 1)
        rk = p.add_run(k + ":")
        rk.font.name = "Arial"
        rk.font.bold = True
        rk.font.size = Pt(9.5)
        rk.font.color.rgb = RGBColor(15, 44, 89)
        rv = p.add_run(v)
        rv.font.name = "Arial"
        rv.font.size = Pt(9.5)
        rv.font.color.rgb = RGBColor(45, 55, 72)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 2.1 Qué hizo
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    rh2 = h2.add_run("2.1. ¿Qué Hizo en el Sprint 1? (Responsabilidades y Logros)")
    rh2.font.name = "Arial"
    rh2.font.size = Pt(12)
    rh2.font.bold = True
    rh2.font.color.rgb = RGBColor(30, 111, 92)

    did_albornoz = [
        "Definición del Sprint 1 Goal: Establecimiento de la meta central del Sprint: 'Desplegar el núcleo arquitectónico (PostgreSQL + PostGIS e infraestructura CI/CD) e implementar el módulo básico de gestión y geocodificación de pedidos para Huancayo, habilitando los insumos de peso, volumen y ventanas de tiempo para el motor VRP del Sprint 2'.",
        "Estructuración y Gestión del Sprint 1 Backlog: Desglose de la Épica EP-01 (Gestión y Validación de Pedidos), redacción de la Historia de Usuario US-001 (Geocodificación con Ventanas de Tiempo) bajo criterios BDD Gherkin (Escenario 1: dirección unívoca y Escenario 2: dirección ambigua con asistencia interactiva), y especificación del Enabler Técnico EN-001 (Infraestructura Espacial PostGIS).",
        "Establecimiento y Cumplimiento del Definition of Done (DoD): Definición de los criterios de aceptación para declarar el incremento como terminado: cobertura mínima del 80% (superada al 87.83%), 100% de pruebas en verde, cero deuda técnica en el core y pipeline de CI/CD automatizado en GitHub Actions.",
        "Gobernanza del Repositorio Git y Políticas de Configuración: Estructuración del árbol de directorios del proyecto (backend/, database/, frontend/, .github/). Blindaje de seguridad en .gitignore para impedir la subida de node_modules y .env. Parametrización en .env.example para la configuración limpia del puerto 8000, credenciales de PostGIS y variables de entorno. Redacción del README.md como guía operativa de despliegue rápido.",
        "Auditoría Técnica y Memoria del Sprint 1 (Guion_Exposicion_Mejorado.md): Consolidación de la viabilidad técnica a costo cero en licencias (uso de PostgreSQL 17 local y Nominatim OpenStreetMap sin APIs de pago comerciales)."
    ]
    for item in did_albornoz:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        bold_part, rest = item.split(":", 1)
        rb = p.add_run(bold_part + ":")
        rb.font.name = "Arial"
        rb.font.bold = True
        rb.font.size = Pt(9.5)
        rb.font.color.rgb = RGBColor(15, 44, 89)
        rr = p.add_run(rest)
        rr.font.name = "Arial"
        rr.font.size = Pt(9.5)
        rr.font.color.rgb = RGBColor(45, 55, 72)

    # 2.2 Rutas Git
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    rh2 = h2.add_run("2.2. Rutas de Git que DEBE Exponer y Explicar")
    rh2.font.name = "Arial"
    rh2.font.size = Pt(12)
    rh2.font.bold = True
    rh2.font.color.rgb = RGBColor(30, 111, 92)

    git_table1 = doc.add_table(rows=5, cols=3)
    gh1 = ["Ruta en el Repositorio Git", "Tipo de Artefacto", "Aspecto Crítico que Debe Explicar en Pantalla"]
    for j, h in enumerate(gh1):
        git_table1.rows[0].cells[j].paragraphs[0].text = h

    git_data1 = [
        ("README.md", "Documentación Raíz Markdown", "Portada técnica del Sprint 1: stack tecnológico (Node.js 22, Express, PostgreSQL 17, PostGIS, Leaflet), arquitectura por capas y comandos de arranque rápido."),
        (".gitignore\n.env.example", "Seguridad y Configuración Git", "Exclusión estricta de node_modules y credenciales privadas; parametrización de variables de entorno seguras (PORT=8000, DB_HOST, DB_PORT=5432)."),
        ("Guion_Exposicion_Mejorado.md", "Memoria Técnica del Sprint 1", "Análisis de viabilidad técnica a costo S/ 0 en licencias, diagnóstico de requisitos locales y certificación del 100% de objetivos del Sprint 1."),
        ("Terminal / Consola Git\n(Comandos de Inspección)", "Verificación de Repositorio en Vivo", "Ejecución en vivo de git status, git branch -a y git log --oneline -n 5 para evidenciar un árbol de trabajo limpio, ramas ordenadas y el commit de cierre spring1.v1.")
    ]
    for i, row_data in enumerate(git_data1):
        row = git_table1.rows[i+1]
        for j, text in enumerate(row_data):
            row.cells[j].paragraphs[0].text = text

    format_table(git_table1, col_widths=[2.3, 1.4, 2.8], header_bg="0F2C59", alt_bg="F8FAFC", border_color="CBD5E1")

    # 2.3 Guion
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    rh2 = h2.add_run("2.3. Guion de Exposición y Pasos en Vivo (Minuto a Minuto)")
    rh2.font.name = "Arial"
    rh2.font.size = Pt(12)
    rh2.font.bold = True
    rh2.font.color.rgb = RGBColor(30, 111, 92)

    speech_p1 = [
        ("Minuto 0:00 - 2:00 (Apertura del Sprint 1 y Sprint Goal)", 
         "\"Buenos días estimado jurado y profesor. Habiendo superado y sustentado en la etapa previa toda la documentación de inicio y planificación del proyecto, el día de hoy presentamos la defensa técnica del Incremento de Software del Sprint 1 de EcoLogCity. El objetivo central (Sprint Goal) de este primer sprint fue desplegar el núcleo arquitectónico de persistencia espacial en PostgreSQL con PostGIS y la infraestructura de CI/CD, implementando a su vez el módulo de registro y geocodificación de pedidos para Huancayo, dejando preparados con precisión de coordenadas, volumen y ventanas de tiempo los insumos requeridos por el motor heurístico del Sprint 2.\""),
        ("Minuto 2:00 - 4:30 (Sprint Backlog, Criterios BDD y Definition of Done)",
         "\"El alcance comprometido para este Sprint 1 se concentró en la Épica EP-01 y la Historia de Usuario US-001, junto al enabler técnico EN-001. Diseñamos la historia bajo el estándar BDD Gherkin: si un despachador ingresa una dirección unívoca de Huancayo, el sistema resuelve de forma inmediata sus coordenadas GPS; si la dirección es ambigua, el sistema despliega opciones y permite asistencia en mapa. Para considerar el sprint terminado, nuestro Definition of Done (DoD) exigió una cobertura de pruebas mínima del 80%, base de datos espacial operativa y validaciones a nivel de base de datos. Como verán hoy, no solo cumplimos el DoD, sino que alcanzamos un 87.83% de cobertura automatizada.\""),
        ("Minuto 4:30 - 7:00 (Gobernanza Git, Repositorio y Pase al Backend)",
         "\"Como responsable de la gobernanza técnica en Git, estructuré el repositorio asegurando que los archivos sensibles y dependencias no se filtren mediante el .gitignore, y definiendo una plantilla reproducible en .env.example. En README.md documentamos la arquitectura del incremento y en Guion_Exposicion_Mejorado.md acreditamos que la solución opera con cero costo de licencias externas. En pantalla observan con git status y git log que nuestro árbol de trabajo se encuentra limpio y versionado bajo el commit spring1.v1. A continuación, cedo la palabra a Alexander Landa, quien sustentará el diseño de la base de datos PostGIS, la API REST y la ejecución en vivo de las pruebas del DoD.\"")
    ]
    for step, speech in speech_p1:
        p_step = doc.add_paragraph()
        p_step.paragraph_format.space_before = Pt(3)
        p_step.paragraph_format.space_after = Pt(1)
        rs = p_step.add_run(step)
        rs.font.name = "Arial"
        rs.font.bold = True
        rs.font.size = Pt(9.5)
        rs.font.color.rgb = RGBColor(15, 44, 89)
        
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(4)
        p_sp.paragraph_format.line_spacing = 1.15
        rsp = p_sp.add_run(speech)
        rsp.font.name = "Arial"
        rsp.font.italic = True
        rsp.font.size = Pt(9)
        rsp.font.color.rgb = RGBColor(45, 55, 72)

    # =========================================================================
    # PARTE 2 - ALEXANDER LANDA
    # =========================================================================
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(4)
    rh1 = h1.add_run("3. Parte 2 — Arquitectura Backend, Base de Datos PostGIS y Calidad (DoD & CI/CD)")
    rh1.font.name = "Arial"
    rh1.font.size = Pt(15)
    rh1.font.bold = True
    rh1.font.color.rgb = RGBColor(15, 44, 89)

    doc.add_paragraph()
    meta_p2 = [
        "Expositor Asignado: Landa Rojas Alexander Nelson",
        "Rol Oficial en el Sprint: Arquitecto de Software & Backend Developer / QA & DevOps Engineer",
        "Tiempo Asignado: 8 a 9 minutos (Núcleo de Datos, API REST, DoD y CI/CD)",
        "Enfoque de Defensa: Modelado Espacial PostGIS, Servicios Node.js, Cobertura Jest (87.83%) y Contenedores Docker"
    ]
    for mp in meta_p2:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)
        k, v = mp.split(":", 1)
        rk = p.add_run(k + ":")
        rk.font.name = "Arial"
        rk.font.bold = True
        rk.font.size = Pt(9.5)
        rk.font.color.rgb = RGBColor(15, 44, 89)
        rv = p.add_run(v)
        rv.font.name = "Arial"
        rv.font.size = Pt(9.5)
        rv.font.color.rgb = RGBColor(45, 55, 72)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 3.1 Qué hizo
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    rh2 = h2.add_run("3.1. ¿Qué Hizo en el Sprint 1? (Responsabilidades y Logros)")
    rh2.font.name = "Arial"
    rh2.font.size = Pt(12)
    rh2.font.bold = True
    rh2.font.color.rgb = RGBColor(30, 111, 92)

    did_landa = [
        "Diseño e Implementación de la Base de Datos Espacial (database/migrations): Configuración de PostgreSQL 17 con extensión PostGIS para cálculo de distancias geodésicas. Creación de la tabla pedidos con UUIDs, índices B-tree y espaciales sobre latitud/longitud, estado y distrito.",
        "Reglas de Negocio en DDL y Validaciones: Implementación de la restricción de integridad check_ventanas_horarias que impide registrar pedidos donde ventana_fin <= ventana_inicio, así como checks de peso_kg > 0 y volumen_m3 > 0.",
        "Carga de Semillas Georreferenciadas (database/seeds): Script SQL con los cuadrantes de cobertura de Huancayo, El Tambo y Chilca, más 8 pedidos reales geolocalizados en el valle del Mantaro.",
        "Desarrollo de la API REST Modular (backend/src/): Arquitectura limpia en capas (Config, Routes, Controllers, Services). Implementación del CRUD de pedidos, validación de esquemas con Zod y endpoint de agregación analítica GET /api/v1/pedidos/stats.",
        "Infraestructura y Contenerización: Configuración de docker-compose.yml con la imagen oficial postgis/postgis:16-3.4 y el servicio de backend para garantizar reproducibilidad en cualquier entorno operativo.",
        "Pipeline de Integración Continua (.github/workflows/ci.yml): Workflow automatizado que en cada Pull Request despliega PostgreSQL, corre migraciones y ejecuta la suite de pruebas validando el DoD.",
        "Aseguramiento de Calidad y Suite de Pruebas (DoD >= 80%): Programación de pruebas con Jest y Supertest en backend/tests/ (pedidos.test.js y endpoints.test.js), logrando 87.83% de cobertura de líneas, 100% en lógica de pedidos y 26/26 pruebas aprobadas."
    ]
    for item in did_landa:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        bold_part, rest = item.split(":", 1)
        rb = p.add_run(bold_part + ":")
        rb.font.name = "Arial"
        rb.font.bold = True
        rb.font.size = Pt(9.5)
        rb.font.color.rgb = RGBColor(15, 44, 89)
        rr = p.add_run(rest)
        rr.font.name = "Arial"
        rr.font.size = Pt(9.5)
        rr.font.color.rgb = RGBColor(45, 55, 72)

    # 3.2 Rutas Git
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    rh2 = h2.add_run("3.2. Rutas de Git que DEBE Exponer y Explicar")
    rh2.font.name = "Arial"
    rh2.font.size = Pt(12)
    rh2.font.bold = True
    rh2.font.color.rgb = RGBColor(30, 111, 92)

    git_table2 = doc.add_table(rows=10, cols=3)
    gh2 = ["Ruta en el Repositorio Git", "Tipo de Artefacto", "Aspecto Crítico que Debe Explicar en Pantalla"]
    for j, h in enumerate(gh2):
        git_table2.rows[0].cells[j].paragraphs[0].text = h

    git_data2 = [
        ("database/migrations/\n001_init_postgis_schema.sql", "Script DDL PostgreSQL + PostGIS", "Mostrar la tabla pedidos: campos UUID, latitud/longitud, peso_kg, volumen_m3 y el CONSTRAINT check_ventanas_horarias."),
        ("database/seeds/\n001_seed_pedidos_huancayo.sql", "Semillas SQL de Prueba", "Mostrar las inserciones de zonas de cobertura (Huancayo, El Tambo, Chilca) y los pedidos reales georreferenciados."),
        ("backend/src/config/db.js", "Conexión a Base de Datos", "Mostrar el cliente pg Pool con reconexión automática y soporte de variables de entorno (DB_HOST, DB_PORT, etc.)."),
        ("backend/src/server.js\nbackend/src/app.js", "Núcleo Servidor Express", "Mostrar la configuración de Express, middlewares cors, express.json(), y montaje del enrutador bajo /api/v1."),
        ("backend/src/routes/api.js", "Enrutador REST Express", "Mostrar los endpoints: POST /pedidos, GET /pedidos, GET /pedidos/stats, PATCH /pedidos/:id/cancelar y GET /health."),
        ("backend/src/controllers/\npedidoController.js", "Controlador HTTP", "Mostrar cómo recibe la petición, valida campos obligatorios con códigos HTTP estándar (201 Created, 400 Bad Request, 404 Not Found)."),
        ("backend/src/services/\npedidoService.js", "Lógica de Negocio y SQL", "Explicar las consultas parametrizadas ($1, $2) que previenen inyección SQL y el cálculo agregativo de stats (peso total y volumen)."),
        ("backend/tests/pedidos.test.js\nbackend/tests/endpoints.test.js", "Suites de Pruebas Jest", "Mostrar los casos de prueba: creación válida, rechazo por ventana horaria invertida y cálculo de métricas agregadas."),
        ("docker-compose.yml\n.github/workflows/ci.yml", "DevOps & CI/CD Pipeline", "Explicar la portabilidad de PostGIS y el pipeline automatizado de GitHub Actions que valida el DoD en cada Pull Request.")
    ]
    for i, row_data in enumerate(git_data2):
        row = git_table2.rows[i+1]
        for j, text in enumerate(row_data):
            row.cells[j].paragraphs[0].text = text

    format_table(git_table2, col_widths=[2.3, 1.4, 2.8], header_bg="0F2C59", alt_bg="F8FAFC", border_color="CBD5E1")

    # 3.3 Guion
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    rh2 = h2.add_run("3.3. Guion de Exposición y Demostración en Terminal (Minuto a Minuto)")
    rh2.font.name = "Arial"
    rh2.font.size = Pt(12)
    rh2.font.bold = True
    rh2.font.color.rgb = RGBColor(30, 111, 92)

    speech_p2 = [
        ("Minuto 0:00 - 2:30 (Base de Datos Espacial PostGIS)",
         "\"Gracias Jeferson. Como Arquitecto Backend, diseñé la persistencia sobre PostgreSQL y PostGIS en database/migrations/001_init_postgis_schema.sql. Para soportar el algoritmo VRPTW, no basta una base de datos relacional genérica: modelamos coordenadas de alta precisión y una restricción a nivel DDL: CONSTRAINT check_ventanas_horarias CHECK (ventana_fin > ventana_inicio). Si un despachador intenta ingresar una entrega con hora fin previa a la de inicio, la base de datos aborta la transacción por integridad.\""),
        ("Minuto 2:30 - 5:00 (Arquitectura de la API REST en Node.js)",
         "\"En backend/src/ estructuré una arquitectura en capas limpias. En routes/api.js definí los endpoints REST bajo la versión 1. El pedidoController.js gestiona la validación HTTP y pedidoService.js ejecuta consultas transaccionales con parámetros para evitar inyecciones SQL. Además, implementé GET /api/v1/pedidos/stats, un endpoint que suma en tiempo real el peso acumulado en kg y el volumen en metros cúbicos, insumos obligatorios para que el algoritmo verifique la capacidad de carga de los camiones de DistriRápido.\""),
        ("Minuto 5:00 - 7:30 (Demostración en Vivo: Cobertura Jest 87.83% y DoD)",
         "\"Para certificar formalmente el Definition of Done (DoD >= 80%), construí 26 pruebas automatizadas con Jest y Supertest en backend/tests/. Voy a ejecutar en vivo el comando de cobertura en la terminal:\""),
        ("Minuto 7:30 - 8:30 (CI/CD y Pase a Frontend)",
         "\"Como observan en la consola, se aprobaron las 26 pruebas con 87.83% de cobertura en líneas y 100% en el servicio de pedidos, superando con creces la meta del 80%. Adicionalmente, el archivo .github/workflows/ci.yml replica este proceso automáticamente en la nube de GitHub Actions. Ahora doy el pase a Junior Quispe, quien explicará el motor de geocodificación OSM y la interfaz interactiva de usuario.\"")
    ]
    for step, speech in speech_p2:
        p_step = doc.add_paragraph()
        p_step.paragraph_format.space_before = Pt(3)
        p_step.paragraph_format.space_after = Pt(1)
        rs = p_step.add_run(step)
        rs.font.name = "Arial"
        rs.font.bold = True
        rs.font.size = Pt(9.5)
        rs.font.color.rgb = RGBColor(15, 44, 89)
        
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(4)
        p_sp.paragraph_format.line_spacing = 1.15
        rsp = p_sp.add_run(speech)
        rsp.font.name = "Arial"
        rsp.font.italic = True
        rsp.font.size = Pt(9)
        rsp.font.color.rgb = RGBColor(45, 55, 72)

        if "comando de cobertura" in step.lower() or "terminal:" in speech.lower():
            add_code_block(doc, "cd C:\\Users\\USER\\Desktop\\EcoLogCity\\backend\nnpm run test:coverage")

    # =========================================================================
    # PARTE 3 - JUNIOR QUISPE
    # =========================================================================
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(4)
    rh1 = h1.add_run("4. Parte 3 — Geocodificación Inteligente, Interfaz Web y Preparación VRP")
    rh1.font.name = "Arial"
    rh1.font.size = Pt(15)
    rh1.font.bold = True
    rh1.font.color.rgb = RGBColor(15, 44, 89)

    doc.add_paragraph()
    meta_p3 = [
        "Expositor Asignado: Quispe Aquino Junior",
        "Rol Oficial en el Sprint: Frontend Developer / UX/UI Designer & Especialista en Geocodificación / Motor VRP",
        "Tiempo Asignado: 8 a 9 minutos (Geocodificación OSM, Frontend Leaflet y Demostración Web)",
        "Enfoque de Defensa: Resolución BDD Gherkin (US-001), Visor Cartográfico Leaflet, Drag & Drop y Preparación VRP"
    ]
    for mp in meta_p3:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)
        k, v = mp.split(":", 1)
        rk = p.add_run(k + ":")
        rk.font.name = "Arial"
        rk.font.bold = True
        rk.font.size = Pt(9.5)
        rk.font.color.rgb = RGBColor(15, 44, 89)
        rv = p.add_run(v)
        rv.font.name = "Arial"
        rv.font.size = Pt(9.5)
        rv.font.color.rgb = RGBColor(45, 55, 72)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 4.1 Qué hizo
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    rh2 = h2.add_run("4.1. ¿Qué Hizo en el Sprint 1? (Responsabilidades y Logros)")
    rh2.font.name = "Arial"
    rh2.font.size = Pt(12)
    rh2.font.bold = True
    rh2.font.color.rgb = RGBColor(30, 111, 92)

    did_quispe = [
        "Motor de Geocodificación Automática para Huancayo (backend/src/services/geocodingService.js): Implementación de un servicio híbrido que utiliza un diccionario local de coordenadas para direcciones críticas y el servicio Nominatim de OpenStreetMap delimitado por el bounding box de Huancayo (-12.0678, -75.2098).",
        "Cumplimiento de Escenarios BDD Gherkin (US-001): Programación del Escenario 1 (dirección unívoca devuelve coordenadas exactas de inmediato) y Escenario 2 (dirección ambigua devuelve hasta 5 sugerencias e invita al ajuste manual).",
        "Geocodificación Reversa: Algoritmo para obtener nombre de calle y distrito cuando el usuario arrastra un punto en el mapa.",
        "Diseño de la Interfaz Web Responsiva (frontend/public/index.html): Maquetación moderna utilizando Tailwind CSS, con distribución de dos columnas (panel de registro a la izquierda y visor cartográfico interactivo a la derecha).",
        "Visor Cartográfico Interactivo con Leaflet (frontend/public/app.js): Renderizado dinámico de mapas en tiempo real. Marcador azul del Almacén Central de DistriRápido, marcadores de pedidos existentes y un marcador rojo móvil (Drag & Drop) para corrección manual de ubicación.",
        "Panel de Indicadores Clave (KPIs) en Tiempo Real: Tarjetas interactivas que consumen la API de estadísticas y muestran la carga total (kg), volumen total (m3) y pedidos pendientes.",
        "Preparación de Insumos para el Algoritmo VRP (Sprint 2): Estructuración del payload de pedidos con ventanas temporales y ubicaciones precisas para alimentar la metaheurística del siguiente sprint."
    ]
    for item in did_quispe:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        bold_part, rest = item.split(":", 1)
        rb = p.add_run(bold_part + ":")
        rb.font.name = "Arial"
        rb.font.bold = True
        rb.font.size = Pt(9.5)
        rb.font.color.rgb = RGBColor(15, 44, 89)
        rr = p.add_run(rest)
        rr.font.name = "Arial"
        rr.font.size = Pt(9.5)
        rr.font.color.rgb = RGBColor(45, 55, 72)

    # 4.2 Rutas Git
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    rh2 = h2.add_run("4.2. Rutas de Git que DEBE Exponer y Explicar")
    rh2.font.name = "Arial"
    rh2.font.size = Pt(12)
    rh2.font.bold = True
    rh2.font.color.rgb = RGBColor(30, 111, 92)

    git_table3 = doc.add_table(rows=7, cols=3)
    gh3 = ["Ruta en el Repositorio Git", "Tipo de Artefacto", "Aspecto Crítico que Debe Explicar en Pantalla"]
    for j, h in enumerate(gh3):
        git_table3.rows[0].cells[j].paragraphs[0].text = h

    git_data3 = [
        ("backend/src/services/\ngeocodingService.js", "Servicio Lógico de Georreferenciación", "Explicar cómo funciona Nominatim con el bounding box de Huancayo, la geocodificación reversa y la resolución de ambigüedad."),
        ("backend/src/controllers/\ngeocodingController.js", "Controlador HTTP Geocoding", "Explicar los endpoints GET /api/v1/geocodificar?q=... y GET /api/v1/geocodificar/reversa?lat=...&lon=..."),
        ("backend/tests/\ngeocoding.test.js", "Pruebas Unitarias de Georreferenciación", "Mostrar los tests de Jest que validan direcciones reales de Huancayo y el fallback seguro cuando la dirección no existe."),
        ("frontend/public/index.html", "Interfaz de Usuario (SPA)", "Mostrar la arquitectura visual: panel de control Tailwind CSS, contenedor #map para Leaflet, KPIs y modal de sugerencias."),
        ("frontend/public/app.js", "Controlador del Cliente JS", "Explicar la inicialización de Leaflet L.map(), el evento dragend del marcador rojo y los fetch() asíncronos hacia la API."),
        ("frontend/package.json", "Configuración Frontend", "Explicar que la app es ligera, sin frameworks pesados, optimizada para responder en milisegundos en computadoras de despacho.")
    ]
    for i, row_data in enumerate(git_data3):
        row = git_table3.rows[i+1]
        for j, text in enumerate(row_data):
            row.cells[j].paragraphs[0].text = text

    format_table(git_table3, col_widths=[2.3, 1.4, 2.8], header_bg="0F2C59", alt_bg="F8FAFC", border_color="CBD5E1")

    # 4.3 Guion
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    rh2 = h2.add_run("4.3. Guion de Exposición y Demostración en Navegador (Minuto a Minuto)")
    rh2.font.name = "Arial"
    rh2.font.size = Pt(12)
    rh2.font.bold = True
    rh2.font.color.rgb = RGBColor(30, 111, 92)

    speech_p3 = [
        ("Minuto 0:00 - 2:00 (El Reto de la Geocodificación en Huancayo)",
         "\"Gracias Alexander. En Huancayo, la geocodificación comercial tradicional como Google Maps es costosa y muchas veces no ubica pasajes o jirones locales. Para cumplir la Historia US-001, implementé en backend/src/services/geocodingService.js un motor basado en OpenStreetMap Nominatim parametrizado exclusivamente para Huancayo (-12.06, -75.20). Esto evita cobros por API tokens y garantiza georreferenciación exacta y geocodificación reversa gratuita.\""),
        ("Minuto 2:00 - 6:00 (Demostración en Vivo en la Aplicación Web http://localhost:8000)",
         "\"Voy a compartir la pantalla del navegador con la aplicación corriendo en localhost:8000. Observen el mapa interactivo en Leaflet: en el centro se ubica el Almacén Central de DistriRápido y en azul los pedidos ya registrados en la base de datos de Huancayo. Ahora haré una demostración de registro en vivo:\n"
         "1. Escribo en dirección: 'Av. Giráldez 150, Huancayo' y hago click en '🔍 Ubicar'.\n"
         "2. El motor ubica inmediatamente el punto exacto y mueve el marcador rojo interactivo.\n"
         "3. Demostración Drag & Drop: si la numeración es imprecisa, arrastro el marcador rojo por el mapa y verán cómo las coordenadas se actualizan automáticamente.\n"
         "4. Completo el cliente 'Bodega Los Andes', peso 15 kg, ventana de 08:00 a 11:00 y guardo el pedido.\n"
         "5. Instantáneamente la tabla de pedidos se refresca y los KPIs superiores incrementan la carga acumulada sin necesidad de recargar la página.\""),
        ("Minuto 6:00 - 8:30 (Conexión con el Motor VRP del Sprint 2 y Conclusión)",
         "\"Esta captura precisa de latitud, longitud, peso, volumen y ventanas de tiempo es el insumo fundamental para el Sprint 2, donde implementaremos el algoritmo genético para la optimización multiobjetivo de rutas con penalización por pendiente. En conclusión, nuestro equipo ha completado el Sprint 1 al 100%, con 87.83% de cobertura y una plataforma funcional lista para la fase metaheurística. Quedamos atentos a las preguntas del jurado.\"")
    ]
    for step, speech in speech_p3:
        p_step = doc.add_paragraph()
        p_step.paragraph_format.space_before = Pt(3)
        p_step.paragraph_format.space_after = Pt(1)
        rs = p_step.add_run(step)
        rs.font.name = "Arial"
        rs.font.bold = True
        rs.font.size = Pt(9.5)
        rs.font.color.rgb = RGBColor(15, 44, 89)
        
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(4)
        p_sp.paragraph_format.line_spacing = 1.15
        rsp = p_sp.add_run(speech)
        rsp.font.name = "Arial"
        rsp.font.italic = True
        rsp.font.size = Pt(9)
        rsp.font.color.rgb = RGBColor(45, 55, 72)

    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    add_callout(doc, [
        "Pasos de la Demostración Web a Realizar por Junior Quispe:",
        "1. Servidor activo en terminal: 'npm start' en backend/ -> http://localhost:8000",
        "2. Probar geocodificación con 'Av. Giráldez 150' o 'Calle Real 450, El Tambo'.",
        "3. Arrastrar el pin rojo en el mapa Leaflet demostrando la geocodificación reversa.",
        "4. Enviar el formulario y mostrar la actualización en tiempo real de los KPIs de carga."
    ], border_color="1E6F5C", bg_color="F0FDF4", title="Checklist de la Demostración en Vivo en Navegador")

    # =========================================================================
    # 5. TABLA CHEAT SHEET
    # =========================================================================
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(4)
    rh1 = h1.add_run("5. Tabla Cheat Sheet Consolidada (Resumen Ejecutivo del Sprint 1)")
    rh1.font.name = "Arial"
    rh1.font.size = Pt(15)
    rh1.font.bold = True
    rh1.font.color.rgb = RGBColor(15, 44, 89)

    doc.add_paragraph()
    intro_cheat = doc.add_paragraph()
    intro_cheat.paragraph_format.space_after = Pt(6)
    intro_cheat.paragraph_format.line_spacing = 1.15
    rc = intro_cheat.add_run(
        "Utilice esta tabla como guía rápida de apoyo durante la sustentación para saber qué archivo exacto "
        "abrir en el editor (VS Code o GitHub) y qué comando ejecutar en cada momento:"
    )
    rc.font.name = "Arial"
    rc.font.size = Pt(9.5)
    rc.font.color.rgb = RGBColor(45, 55, 72)

    cheat_table = doc.add_table(rows=4, cols=5)
    ch_headers = ["Integrante", "Rol en el Sprint 1", "Archivos Git que Debe Abrir", "Comando / Acción en Vivo", "Frase Clave de Cierre"]
    for j, h in enumerate(ch_headers):
        cheat_table.rows[0].cells[j].paragraphs[0].text = h

    cheat_rows = [
        (
            "Albornoz Peña\nJeferson Bener",
            "Líder Técnico & Scrum Master\nDirector de Proyecto (PM)",
            "• README.md\n• .gitignore, .env.example\n• Guion_Exposicion_Mejorado.md",
            "Terminal:\ngit status\ngit branch -a\ngit log --oneline -n 5",
            "\"El Sprint 1 habilitó la infraestructura base con 87.83% de cobertura y 0 deuda técnica.\""
        ),
        (
            "Landa Rojas\nAlexander Nelson",
            "Arquitecto Backend\nQA / DevOps Engineer",
            "• database/migrations/001\n• backend/src/services/pedidoService.js\n• backend/tests/pedidos.test.js\n• .github/workflows/ci.yml",
            "Terminal:\ncd backend\nnpm run test:coverage",
            "\"Validamos las ventanas horarias en base de datos y superamos el DoD con 87.83%.\""
        ),
        (
            "Quispe Aquino\nJunior",
            "Frontend / UX Designer\nGeocoding & VRP Specialist",
            "• backend/src/services/geocodingService.js\n• frontend/public/index.html\n• frontend/public/app.js",
            "Navegador web:\nhttp://localhost:8000\n(Registrar pedido y mover pin)",
            "\"Resolvemos la geocodificación en Huancayo a costo cero y listos para el motor VRP.\""
        )
    ]
    for i, row_data in enumerate(cheat_rows):
        row = cheat_table.rows[i+1]
        for j, text in enumerate(row_data):
            row.cells[j].paragraphs[0].text = text

    format_table(cheat_table, col_widths=[1.3, 1.3, 1.8, 1.3, 1.1], header_bg="0F2C59", alt_bg="F8FAFC", border_color="CBD5E1")

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 6. BANCO DE PREGUNTAS Y RESPUESTAS ANTE EL JURADO
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(4)
    rh1 = h1.add_run("6. Banco de Preguntas Típicas del Jurado y Respuestas por Rol")
    rh1.font.name = "Arial"
    rh1.font.size = Pt(15)
    rh1.font.bold = True
    rh1.font.color.rgb = RGBColor(15, 44, 89)

    doc.add_paragraph()
    qa_list = [
        ("Pregunta para Jeferson (Líder Técnico / Scrum Master): ¿Cómo gestionaron el alcance técnico del Sprint 1 para garantizar el cumplimiento del Definition of Done sin acumular deuda técnica?",
         "Respuesta recomendada: \"Delimitamos el Sprint 1 estrictamente a la captura y georreferenciación de pedidos (EP-01 / US-001) y la habilitación de la base de datos PostGIS (EN-001), evitando adelantar código del optimizador antes de tener insumos validados. Fijamos como Definition of Done que cada funcionalidad cuente con pruebas automatizadas que superen el 80% de cobertura y pasen por el pipeline de CI en GitHub Actions. Con esto logramos 87.83% de cobertura y un incremento 100% estable para arrancar el Sprint 2.\""),
        ("Pregunta para Alexander (Backend/QA): ¿Por qué implementaron PostGIS y cómo garantizan que no existan inconsistencias horarias?",
         "Respuesta recomendada: \"PostGIS nos brinda cálculo geodésico nativo sobre el elipsoide terrestre para distancias reales entre coordenadas, evitando distorsiones euclidianas. Para la consistencia horaria, no delegamos la validación únicamente al cliente: establecimos un CONSTRAINT DDL check_ventanas_horarias a nivel de base de datos relacional y pruebas unitarias automáticas en Jest que aseguran un 100% de cobertura en la lógica de pedidos.\""),
        ("Pregunta para Junior (Frontend/Geocoding): ¿Cómo resuelven el problema de direcciones informales o inexactas en Huancayo?",
         "Respuesta recomendada: \"Implementamos un enfoque en dos capas bajo la especificación BDD US-001. La capa automática consulta OpenStreetMap Nominatim acotado a Huancayo; si la dirección es ambigua o imprecisa, la interfaz activa el modo de confirmación asistida, desplegando un pin rojo con Drag & Drop en Leaflet. Esto le permite al despachador mover manualmente el marcador hacia el local exacto, calculando la geocodificación reversa instantáneamente.\"\n")
    ]
    for q, a in qa_list:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(4)
        p_q.paragraph_format.space_after = Pt(1)
        rq = p_q.add_run("❓ " + q)
        rq.font.name = "Arial"
        rq.font.bold = True
        rq.font.size = Pt(9.5)
        rq.font.color.rgb = RGBColor(15, 44, 89)
        
        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_before = Pt(0)
        p_a.paragraph_format.space_after = Pt(4)
        p_a.paragraph_format.line_spacing = 1.15
        ra = p_a.add_run("💡 " + a)
        ra.font.name = "Arial"
        ra.font.size = Pt(9)
        ra.font.color.rgb = RGBColor(45, 55, 72)

    # GUARDAR DOCUMENTO
    output_docx = "EcoLogCity_Plan_Exposicion_Roles_Rutas_Git.docx"
    doc.save(output_docx)
    print(f"Documento generado exitosamente: {output_docx}")

if __name__ == "__main__":
    create_document()
