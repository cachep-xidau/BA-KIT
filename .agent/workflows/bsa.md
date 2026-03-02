---
description: Business System Analyst workflow. Requirements gathering, process modeling, gap analysis, and solution documentation.
---

# BSA Workflow | Quy trình BSA

Business Systems Analyst workflow from business request to working demo.
**Quy trình làm việc của Chuyên viên Phân tích Hệ thống Kinh doanh từ yêu cầu nghiệp vụ đến demo sản phẩm.**

```
Initiation → Assessment → Requirements → Analysis → Design → Demo
     ↓           ↓            ↓            ↓          ↓        ↓
  Setup       Brief        BRD        FRD/Specs   Diagrams  Prototype
```

---

## Knowledge Base Integration | Tích hợp Kho Kiến thức

**Before EVERY phase: | Trước MỌI giai đoạn:**
1. Check `kb/` directory exists | Kiểm tra thư mục `kb/` tồn tại
2. Load relevant knowledge | Tải kiến thức liên quan:
   - `kb/domain/glossary.md` - Business terminology | Thuật ngữ nghiệp vụ
   - `kb/domain/business-rules.md` - Known constraints | Ràng buộc đã biết
   - `kb/systems/` - System profiles for integration context | Hồ sơ hệ thống để tích hợp
   - `kb/lessons/` - Past decisions and pitfalls | Quyết định và bài học trong quá khứ

**After EVERY phase: | Sau MỌI giai đoạn:**
1. Capture new domain terms → `kb/domain/` | Thu thập thuật ngữ mới
2. Document discovered rules → `kb/domain/business-rules.md` | Ghi chép quy tắc mới phát hiện
3. Record reusable patterns → `kb/artifacts/` | Lưu mẫu có thể tái sử dụng
4. Log lessons learned → `kb/lessons/` | Ghi lại bài học kinh nghiệm
5. **Persist key context** via `save_memory` (claude-mem) | Lưu context quan trọng qua session

---

## 🔌 MCP Tools Available | Công cụ MCP Sẵn có

BSA workflow sử dụng các MCP servers sau:

| MCP Server | Tools | Phase |
|---|---|---|
| **Confluence** | `confluence_search`, `confluence_get_page`, `confluence_list_pages` | 0-3: Pull existing docs, SOPs, specs |
| **Figma** (4 accounts) | `get_figma_data`, `download_figma_images` | 4-5: Read designs, screen descriptions |
| **figma-a2v** (Raw API) | `get_file_nodes`, `get_file_styles`, `get_file_components`, `get_comments` | 4: Deep component/style audit |
| **Playwright** | `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_evaluate` | 5: Prototype testing, demo verification |
| **claude-mem** | `search`, `save_memory` | All: Cross-session BSA context |

### Figma Account Routing

| Account | MCP Prefix | Use When |
|---|---|---|
| Default | `mcp__figma__` | General projects |
| AMS | `mcp__AMS_Figma__` | AMS projects |
| A2V | `mcp__A2V__` | A2V projects |
| AMS-Web3 | `mcp__AMS-Web3__` | AMS Web3 projects |
| Raw API | `mcp__figma-a2v__` | Deep analysis: styles, components, comments |

---

## Phase Overview | Tổng quan các Giai đoạn

| Phase | Giai đoạn | Objective | Mục tiêu | Output | Đầu ra |
|-------|-----------|-----------|----------|--------|--------|
| 0 | Initiation | Project foundation | Nền tảng dự án | Charter, Stakeholder List, Tools Ready |
| 1 | Assessment | Understand business problem | Hiểu vấn đề nghiệp vụ | Assessment Report / Project Brief |
| 2 | Requirements | Elicit detailed requirements | Thu thập yêu cầu chi tiết | BRD |
| 3 | Analysis | Break down requirements | Phân rã yêu cầu | FRD, FR/NFR Specs |
| 4 | Design | Technical design artifacts | Sản phẩm thiết kế | ERD, UML, User Stories, Tech Specs |
| 5 | Demo | Working prototype | Prototype hoạt động | Working Prototype, Sign-off |

---

## Phase 0: Initiation & Setup | Khởi tạo & Thiết lập

**Input:** Business Request / Initial Inquiry | Yêu cầu nghiệp vụ / Câu hỏi ban đầu

### 0.1 Project Kickoff | Khởi động Dự án
- Initial stakeholder meeting | Họp ban đầu với các bên liên quan
- Project charter definition | Định nghĩa hiến chương dự án
- Success criteria establishment | Thiết lập tiêu chí thành công
- Timeline and milestone alignment | Sắp xếp timeline và milestone

### 0.2 BSA Tools & Environment Setup | Thiết lập Công cụ & Môi trường BSA
- **Confluence MCP** — Search existing docs: `confluence_search`, `confluence_get_page`
- **Figma MCP** — Design access (see MCP routing table above)
- **Playwright MCP** — Prototype testing in Phase 5
- dbdiagram.io/ERD tools setup | Thiết lập công cụ ERD
- Knowledge base initialization (`kb/` structure) | Khởi tạo kho kiến thức

### 0.3 Stakeholder Identification | Xác định Bên liên quan
- Create initial stakeholder list | Tạo danh sách bên liên quan ban đầu
- Define roles and responsibilities | Định nghĩa vai trò và trách nhiệm
- Establish RACI matrix (preliminary) | Thiết lập ma trận RACI (sơ bộ)
- Set up communication plan | Lập kế hoạch giao tiếp

### 0.4 Information Gathering Preparation | Chuẩn bị Thu thập Thông tin
- Identify documentation sources | Xác định nguồn tài liệu
- Schedule stakeholder interviews | Lên lịch phỏng vấn bên liên quan
- Prepare assessment questionnaires | Chuẩn bị bảng câu hỏi đánh giá

**Output:** Project Charter, Stakeholder List, Tools Setup Complete, KB Structure Ready

---

## Phase 1: Assessment (Business Discovery) | Đánh giá (Khám phá Nghiệp vụ)

**Input:** Business Request / Painpoint / Description file

### 1.1 Project Goal & Problem Definition | Mục tiêu Dự án & Định nghĩa Vấn đề
- What is the purpose of this app/system? | Mục đích của ứng dụng/hệ thống là gì?
- What business problem does it solve? | Giải quyết vấn đề nghiệp vụ nào?
- What pain points does it address? | Giải quyết những điểm đau nào?
- What business value does it deliver? | Mang lại giá trị nghiệp vụ gì?

### 1.2 User Scope | Phạm vi Người dùng
- Primary users identification | Xác định người dùng chính
- User personas and characteristics | Persona và đặc điểm người dùng
- User journey mapping (high-level) | Sơ đồ hành trình người dùng (mức cao)

### 1.3 Feature Requirements (High-level) | Yêu cầu Tính năng (Mức cao)
- Core features and capabilities | Tính năng và khả năng cốt lõi
- Must-have vs Nice-to-have (MoSCoW) | Bắt buộc vs Nên có (MoSCoW)

### 1.4 Platform & System Selection | Lựa chọn Nền tảng & Hệ thống
- Platform recommendation (Web/Mobile/Both) | Đề xuất nền tảng
- System architecture approach | Cách tiếp cận kiến trúc hệ thống
- Technology constraints | Ràng buộc công nghệ

**Output:** Assessment Report / Project Brief

---

## Phase 2: Requirements Gathering | Thu thập Yêu cầu

**Input:** Assessment Report | Báo cáo đánh giá

### Activities | Hoạt động
- Stakeholder interviews and workshops | Phỏng vấn và workshop với bên liên quan
- **Document analysis via Confluence MCP** | Phân tích tài liệu qua Confluence:
  - `confluence_search("project requirements")` → Find existing specs, SOPs
  - `confluence_get_page(pageId)` → Pull full content for analysis
- Observation of current processes | Quan sát quy trình hiện tại

**Output:** BRD (Business Requirements Document) | Tài liệu Yêu cầu Nghiệp vụ

---

## Phase 3: Analysis & Decomposition | Phân tích & Phân rã

**Input:** BRD

### 3.1 Requirements Decomposition | Phân rã Yêu cầu
- Functional Requirements (FR) specs | Đặc tả Yêu cầu Chức năng (FR)
- Non-Functional Requirements (NFR) specs | Đặc tả Yêu cầu Phi chức năng (NFR)
- Business rules documentation | Tài liệu hóa quy tắc nghiệp vụ

### 3.2 Analysis Techniques | Kỹ thuật Phân tích
- Gap Analysis (as-is vs to-be) | Phân tích Khoảng cách (hiện tại vs tương lai)
- Impact Analysis (change assessment) | Phân tích Tác động (đánh giá thay đổi)
- Process Analysis (flowcharts) | Phân tích Quy trình (sơ đồ luồng)
- Data Analysis (data flows) | Phân tích Dữ liệu (luồng dữ liệu)

### 3.3 Stakeholder Management | Quản lý Bên liên quan
- RACI Matrix | Ma trận RACI
- Communication plan | Kế hoạch giao tiếp

**Output:** FRD, FR/NFR Specs, Analysis Reports

---

## Phase 4: Solution Design | Thiết kế Giải pháp

**Input:** FRD, FR/NFR Specs

### 4.1 Data Design | Thiết kế Dữ liệu
- ERD with DBML syntax (dbdiagram.io) | Sơ đồ ERD với cú pháp DBML
- Data dictionary | Từ điển dữ liệu
- Data architecture | Kiến trúc dữ liệu

### 4.2 UML Diagrams | Biểu đồ UML
- Use Case Diagrams (actor interactions) | Biểu đồ Use Case
- Sequence Diagrams (object interactions) | Biểu đồ Sequence

### 4.3 User Stories (Lean Format)
- Simplified AC format: `User [action] → System: [response]`
- NO Given/When/Then (too verbose) | KHÔNG dùng Given/When/Then
- Business Rules | Quy tắc nghiệp vụ
- Exception Handling | Xử lý ngoại lệ
- Technical code → SRS Document with reference IDs | Code kỹ thuật → SRS

### 4.4 Function List (Ultra-Lean Format)
- Main Flow only (3-5 steps) | Chỉ Main Flow (3-5 bước)
- NFR when applicable (Performance, Security, Reliability, Scalability)
- Function Overview Table with Jira/Figma links

### 4.5 Integration Design | Thiết kế Tích hợp
- API specifications | Đặc tả API
- Integration patterns | Mẫu tích hợp

### 4.6 UI/UX Design | Thiết kế UI/UX
- Wireframes and user flows | Wireframe và luồng người dùng
- Screen descriptions | Mô tả màn hình
- **Figma Design Reading** — Use MCP tools directly:
  - `mcp__figma__get_figma_data(fileKey, nodeId)` → Simplified layout data
  - `mcp__figma__download_figma_images(fileKey, nodes)` → Export images
  - `mcp__figma-a2v__get_file_nodes(fileKey, node_ids)` → Deep node analysis
  - `mcp__figma-a2v__get_file_styles(fileKey)` → Design tokens
  - See **Figma Account Routing** table for multi-account selection

### 4.7 Development Environment Setup | Thiết lập Môi trường Phát triển
- Repository setup (GitHub/GitLab/Bitbucket)
- CI/CD pipeline configuration
- Development database provisioning
- Environment variables and secrets management

**Output:** ERD, UML Diagrams, User Stories, SRS, Function List, Tech Specs, Dev Environment Ready

---

## Phase 5: Demo & Presentation | Demo & Trình bày

**Input:** Design artifacts, User Stories

### 5.1 Prototyping Environment Setup | Thiết lập Môi trường Prototype
- Next.js/React project initialization
- shadcn/ui component library setup
- Tailwind CSS configuration
- Mock data and API setup
- Deployment platform (Vercel/Netlify) configuration

### 5.2 Rapid Prototyping | Tạo Prototype Nhanh
- Use v0.dev for quick UI generation
- shadcn/ui + Tailwind CSS components
- Mock frontend implementation

### 5.3 Demo Preparation | Chuẩn bị Demo
- Working prototype | Prototype hoạt động
- Click-through demo | Demo click-through
- Stakeholder presentation | Trình bày với bên liên quan

### 5.4 Validation | Xác thực
- **Automated testing via Playwright MCP** | Test tự động qua Playwright:
  - `mcp__playwright__browser_navigate(url)` → Open prototype
  - `mcp__playwright__browser_resize({ width: 1440, height: 900 })` → Resize browser to reduce tokens
  - `mcp__playwright__browser_snapshot()` → Capture accessibility state
  - `mcp__playwright__browser_take_screenshot({ type: "jpeg" })` → Visual verification (JPEG viewport-only, never fullPage PNG)
  - Verify key flows match user stories
- Stakeholder feedback collection | Thu thập phản hồi
- Iteration based on feedback | Lặp lại dựa trên phản hồi
- Sign-off | Phê duyệt

**Output:** Working Prototype, Demo, Stakeholder Sign-off

---

## Quick Reference | Tham khảo Nhanh

### Skills & Agents by Phase

| Phase | Skills | Agents |
|-------|--------|--------|
| All | `bsa-analysis`, `brainstorming` | `project-planner` |
| 0: Initiation | `bsa-analysis` (stakeholder-analysis) | `project-planner` |
| 1: Assessment | `bsa-analysis` (requirements-analysis, architecture-design) | `project-planner` |
| 2: Requirements | `bsa-analysis` (functional-requirements, non-functional-requirements) | `project-planner` |
| 3: Analysis | `bsa-analysis` (gap-analysis, impact-analysis, process-analysis, data-analysis) | `project-planner` |
| 4: Design | `bsa-solution-design` (erd-dbdiagram, user-story, function-list, srs, use-case-diagram, sequence-diagram) | `backend-specialist`, `frontend-specialist` |
| 5: Demo | `bsa-solution-design` (ui-ux-design, screen-description), `prototype-builder`, `frontend-design` | `frontend-specialist` |

### BSA vs Product Manager — Boundary Guide

| Task | Use BSA | Use Product Manager |
|---|---|---|
| BRD (business requirements) | ✅ `bsa-analysis` | — |
| PRD (product requirements) | — | ✅ `feature-spec` |
| FRD (functional requirements) | ✅ `bsa-analysis` | — |
| Stakeholder analysis (RACI) | ✅ `bsa-analysis` | — |
| Stakeholder updates (status/risk) | — | ✅ `stakeholder-comms` |
| Gap/Impact/Process analysis | ✅ `bsa-analysis` | — |
| Competitive analysis | — | ✅ `competitive-analysis` |
| ERD, UML, Sequence diagrams | ✅ `bsa-solution-design` | — |
| Roadmap prioritization | — | ✅ `roadmap-management` |
| User research synthesis | — | ✅ `user-research-synthesis` |
| Metrics/OKR review | — | ✅ `metrics-tracking` |
| MoSCoW prioritization | ✅ Both can do | ✅ Both can do |

---

## Deliverables Checklist | Danh sách Sản phẩm

### Phase 0: Initiation & Setup
- [ ] Project Charter | Hiến chương dự án
- [ ] Stakeholder List & RACI Matrix | Danh sách bên liên quan & Ma trận RACI
- [ ] Tools & Environment Setup Complete
- [ ] Knowledge Base Structure Ready

### Phase 1: Assessment
- [ ] Assessment Report / Project Brief

### Phase 2: Requirements Gathering
- [ ] BRD - Business Requirements Document

### Phase 3: Analysis & Decomposition
- [ ] FRD - Functional Requirements Document
- [ ] FR/NFR Specifications

### Phase 4: Solution Design
- [ ] ERD - Entity Relationship Diagram
- [ ] Use Case Diagrams
- [ ] Sequence Diagrams
- [ ] User Stories with Acceptance Criteria
- [ ] Development Environment Ready

### Phase 5: Demo & Presentation
- [ ] Working Prototype
- [ ] Stakeholder Sign-off

### Continuous
- [ ] Knowledge Base Updated (`kb/` directory)

---

## Usage Examples

```
/bsa                           # Start full BSA workflow
/bsa phase 0                   # Run Phase 0: Initiation
/bsa phase 1 {project}         # Run Phase 1: Assessment for project
/bsa phase 2                   # Run Phase 2: Requirements
/bsa phase 3                   # Run Phase 3: Analysis
/bsa phase 4                   # Run Phase 4: Design
/bsa phase 5                   # Run Phase 5: Demo
```

---

## After BSA Workflow

Tell user:
```
[OK] BSA Phase {N} complete: docs/bsa/{project-slug}/

Deliverables created:
- [List phase-specific deliverables]

Next steps:
- Review deliverables with stakeholders
- Proceed to Phase {N+1}
- Or run `/ck:plan` to create implementation plan
```

---

**Last Updated:** 2026-02-08
**Version:** 4.0 (MCP Integration + Product Manager boundary)
