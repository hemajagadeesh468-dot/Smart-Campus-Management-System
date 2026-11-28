/* =====================================================
   CAMPUSIQ FACULTY API CONNECTION
   Keep this URL aligned with the Java backend port.
===================================================== */
const CAMPUSIQ_API_BASE = "http://localhost:8081/api";

async function campusIQRequest(endpoint, options = {}) {
    const token = localStorage.getItem("campusiqFacultyToken");
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${CAMPUSIQ_API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed (${response.status})`);
    }

    return data;
}


/* =====================================================
   CAMPUSIQ - FACULTY PORTAL
   Complete Shared JavaScript
===================================================== */

document.addEventListener("DOMContentLoaded", () => { 
/* ==========================================
   FACULTY DASHBOARD - LIVE API DATA
========================================== */

    async function loadFacultyDashboard() {
    const dashboardSection = document.querySelector(".overview-grid");

    if (!dashboardSection) return;

    const token = localStorage.getItem("campusiqFacultyToken");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const data = await campusIQRequest("/dashboard");
        const cards = dashboardSection.querySelectorAll(".overview-card");

        if (cards[0]) cards[0].querySelector("h3").textContent = data.courses ?? 0;
        if (cards[1]) cards[1].querySelector("h3").textContent = data.students ?? 0;

        if (cards[2]) {
            cards[2].querySelector("h3").textContent = data.assignments ?? 0;
            cards[2].querySelector("small").textContent =
                `${data.pendingReviews ?? 0} pending reviews`;
        }

        if (cards[3]) {
            const timetable = await campusIQRequest("/timetable");
            cards[3].querySelector("h3").textContent =
                Array.isArray(timetable) ? timetable.length : 0;
            cards[3].querySelector("small").textContent = "Scheduled sessions";
        }

    } catch (error) {
        console.error("Dashboard loading failed:", error);
    }
}

    loadFacultyDashboard();

    /* =================================================
       1. LOGIN - SHOW / HIDE PASSWORD
    ================================================= */

    const passwordInput = document.getElementById("facultyPassword");
    const togglePassword = document.getElementById("togglePassword");

    if (passwordInput && togglePassword) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";

            passwordInput.type = isPassword ? "text" : "password";
            togglePassword.textContent = isPassword ? "Hide" : "Show";
        });
    }


    /* =================================================
       2. LOGIN FORM
    ================================================= */

    const loginForm = document.getElementById("facultyLoginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("facultyEmail");
            const password = document.getElementById("facultyPassword");
            const submitButton = loginForm.querySelector('button[type="submit"], input[type="submit"]');

            if (!email || !password) return;

            if (!email.value.trim() || !password.value.trim()) {
                if (loginMessage) loginMessage.textContent = "Please enter your email and password.";
                return;
            }

            if (submitButton) submitButton.disabled = true;
            if (loginMessage) {
                loginMessage.textContent = "Signing in...";
                loginMessage.style.color = "";
            }

            try {
                const result = await campusIQRequest("/login", {
                    method: "POST",
                    body: JSON.stringify({
                        email: email.value.trim(),
                        password: password.value
                    })
                });

                if (!result.token || !result.faculty) {
                    throw new Error("The server returned an incomplete login response.");
                }

                localStorage.setItem("campusiqFacultyToken", result.token);
                localStorage.setItem("campusiqFacultyUser", JSON.stringify(result.faculty));

                if (loginMessage) {
                    loginMessage.textContent = "Login successful. Opening your dashboard...";
                    loginMessage.style.color = "green";
                }

                window.location.href = "dashboard.html";
            } catch (error) {
                if (loginMessage) {
                    loginMessage.textContent = error.message === "Failed to fetch"
                        ? "Cannot connect to the backend. Start the Java server on port 8081."
                        : error.message;
                    loginMessage.style.color = "#c0392b";
                } else {
                    alert(error.message);
                }
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }


    /* =================================================
       3. FORGOT PASSWORD
    ================================================= */

    const forgotPassword = document.getElementById("forgotPassword");

    if (forgotPassword) {
        forgotPassword.addEventListener("click", (event) => {
            event.preventDefault();

            alert(
                "Please contact your campus administrator to reset your password."
            );
        });
    }


    /* =================================================
       4. LIGHT / DARK MODE
    ================================================= */

    const root = document.documentElement;

    const themeButtons = document.querySelectorAll(
        ".theme-button, #themeToggle, #themeButton, .theme-toggle, [data-theme-toggle]"
    );

    function applyTheme(theme) {

        root.setAttribute("data-theme", theme);

        themeButtons.forEach((button) => {

            button.textContent =
                theme === "dark" ? "☀️" : "🌙";

            button.setAttribute(
                "aria-label",
                theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );

            button.setAttribute("title",
                theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );
        });

        try {
            localStorage.setItem("campusiq-theme", theme);
        } catch (error) {
            console.warn("Theme preference could not be saved.");
        }
    }

    let savedTheme = "dark";

    try {
        savedTheme = localStorage.getItem("campusiq-theme") || "dark";
    } catch (error) {
        savedTheme = "dark";
    }

    applyTheme(savedTheme);

    themeButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const currentTheme =
                root.getAttribute("data-theme") || "dark";

            const newTheme =
                currentTheme === "dark" ? "light" : "dark";

            applyTheme(newTheme);
        });

    });


    /* =================================================
       5. CURRENT DATE
    ================================================= */

    const dateElements = document.querySelectorAll(
        "#currentDate, #todayDate, .current-date"
    );

    const today = new Date();

    const formattedDate = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    dateElements.forEach((element) => {
        element.textContent = formattedDate;
    });


    /* =================================================
       6. MOBILE SIDEBAR
    ================================================= */

    const menuButton = document.getElementById("menuButton");
    const facultySidebar = document.getElementById("facultySidebar");

    if (menuButton && facultySidebar) {

        let sidebarOverlay =
            document.querySelector(".sidebar-overlay");

        if (!sidebarOverlay) {
            sidebarOverlay = document.createElement("div");
            sidebarOverlay.className = "sidebar-overlay";
            document.body.appendChild(sidebarOverlay);
        }

        function openSidebar() {
            facultySidebar.classList.add("sidebar-open");
            sidebarOverlay.classList.add("active");

            menuButton.setAttribute("aria-expanded", "true");
        }

        function closeSidebar() {
            facultySidebar.classList.remove("sidebar-open");
            sidebarOverlay.classList.remove("active");

            menuButton.setAttribute("aria-expanded", "false");
        }

        menuButton.addEventListener("click", (event) => {

            event.stopPropagation();

            if (facultySidebar.classList.contains("sidebar-open")) {
                closeSidebar();
            } else {
                openSidebar();
            }

        });

        sidebarOverlay.addEventListener("click", closeSidebar);

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeSidebar();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) {
                closeSidebar();
            }
        });

        facultySidebar.querySelectorAll(".nav-link").forEach((link) => {

            link.addEventListener("click", () => {
                if (window.innerWidth <= 900) {
                    closeSidebar();
                }
            });

        });
    }


    /* =================================================
       7. COURSE SEARCH
    ================================================= */

    const courseSearch =
        document.getElementById("courseSearch") ||
        document.querySelector(".course-search");

    const courseCards =
        document.querySelectorAll(".course-card");

    const courseCount =
        document.getElementById("courseCount") ||
        document.querySelector(".course-count strong");

    const noCoursesMessage =
        document.getElementById("noCoursesMessage");

    if (courseSearch && courseCards.length > 0) {

        function filterCourses() {

            const searchText =
                courseSearch.value.toLowerCase().trim();

            let visibleCount = 0;

            courseCards.forEach((card) => {

                const cardText = card.textContent.toLowerCase();

                const matches = cardText.includes(searchText);

                card.style.display = matches ? "" : "none";

                if (matches) {
                    visibleCount++;
                }

            });

            if (courseCount) {
                courseCount.textContent =
                    String(visibleCount).padStart(2, "0");
            }

            if (noCoursesMessage) {
                noCoursesMessage.hidden = visibleCount !== 0;
            }
        }

        courseSearch.addEventListener("input", filterCourses);

    }


    /* =================================================
       8. ACTIVE SIDEBAR LINK
    ================================================= */

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    document.querySelectorAll(".sidebar-nav .nav-link").forEach((link) => {

        const linkPage = link.getAttribute("href");

        if (!linkPage) return;

        const linkFile = linkPage
            .split("/")
            .pop()
            .toLowerCase();

        if (linkFile === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }

    });


    /* =================================================
       9. PREVENT EMPTY LINK JUMPS
    ================================================= */

    document.querySelectorAll('a[href="#"]').forEach((link) => {

        if (
            link.id !== "forgotPassword" &&
            !link.hasAttribute("data-allow-empty-link")
        ) {
            link.addEventListener("click", (event) => {
                event.preventDefault();
            });
        }

    });

});


/* =====================================
   ATTENDANCE PAGE FUNCTIONALITY
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    const attendancePage = document.querySelector(".attendance-page");

    if (!attendancePage) return;

    const tableBody = document.getElementById("attendanceTableBody");
    const searchInput = document.getElementById("attendanceSearch");
    const courseFilter = document.getElementById("courseFilter");
    const statusFilter = document.getElementById("statusFilter");
    const emptyMessage = document.getElementById("attendanceEmpty");
    const resultCount = document.getElementById("attendanceResultCount");

    const rows = Array.from(tableBody.querySelectorAll("tr"));

    // Display current date
    const dateElement = document.getElementById("attendanceDate");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    // Update attendance summary
    function updateSummary() {

        const present = rows.filter(row =>
            row.querySelector(".attendance-status").textContent.trim() === "Present"
        ).length;

        const absent = rows.length - present;

        const presentCount = document.getElementById("presentCount");
        const absentCount = document.getElementById("absentCount");
        const rate = document.getElementById("attendanceRate");

        if (presentCount) presentCount.textContent = present;
        if (absentCount) absentCount.textContent = absent;

        if (rate) {
            rate.textContent = rows.length
                ? ((present / rows.length) * 100).toFixed(1) + "%"
                : "0%";
        }
    }

    // Filter student records
    function filterAttendance() {

        const searchValue = searchInput.value.toLowerCase().trim();
        const selectedCourse = courseFilter.value;
        const selectedStatus = statusFilter.value;

        let visibleCount = 0;

        rows.forEach(row => {

            const studentText = row.textContent.toLowerCase();
            const course = row.dataset.course;
            const status = row.querySelector(".attendance-status").textContent.trim();

            const matchesSearch = studentText.includes(searchValue);
            const matchesCourse =
                selectedCourse === "all" || course === selectedCourse;
            const matchesStatus =
                selectedStatus === "all" || status === selectedStatus;

            const visible = matchesSearch && matchesCourse && matchesStatus;

            row.style.display = visible ? "" : "none";

            if (visible) visibleCount++;
        });

        emptyMessage.style.display = visibleCount === 0 ? "block" : "none";

        resultCount.textContent =
            `Showing ${visibleCount} student record${visibleCount !== 1 ? "s" : ""}`;
    }

    searchInput.addEventListener("input", filterAttendance);
    courseFilter.addEventListener("change", filterAttendance);
    statusFilter.addEventListener("change", filterAttendance);

    // Change attendance status
    tableBody.addEventListener("click", function (event) {

        const button = event.target.closest(".attendance-action");

        if (!button) return;

        const row = button.closest("tr");
        const statusElement = row.querySelector(".attendance-status");

        const currentStatus = statusElement.textContent.trim();
        const newStatus = currentStatus === "Present" ? "Absent" : "Present";

        statusElement.textContent = newStatus;
        statusElement.className = "attendance-status " + newStatus.toLowerCase();

        updateSummary();
        filterAttendance();
    });

    // Reset all filters
    document.getElementById("resetAttendance").addEventListener("click", function () {

        searchInput.value = "";
        courseFilter.value = "all";
        statusFilter.value = "all";

        filterAttendance();
    });

    updateSummary();
    filterAttendance();

});


/* =====================================
   ASSIGNMENTS PAGE FUNCTIONALITY
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    const page = document.querySelector(".assignments-page");
    if (!page) return;

    const grid = document.getElementById("assignmentGrid");
    const search = document.getElementById("assignmentSearch");
    const courseFilter = document.getElementById("assignmentCourseFilter");
    const statusFilter = document.getElementById("assignmentStatusFilter");

    const modal = document.getElementById("assignmentModal");
    const form = document.getElementById("assignmentForm");

    const titleInput = document.getElementById("newAssignmentTitle");
    const courseInput = document.getElementById("newAssignmentCourse");
    const descriptionInput = document.getElementById("newAssignmentDescription");
    const dueInput = document.getElementById("newAssignmentDue");
    const marksInput = document.getElementById("newAssignmentMarks");

    const totalAssignments = document.getElementById("totalAssignments");
    const activeAssignments = document.getElementById("activeAssignments");

    function updateStats() {
        const cards = Array.from(grid.querySelectorAll(".assignment-card"));

        const active = cards.filter(card =>
            card.dataset.status === "Active"
        ).length;

        totalAssignments.textContent = String(cards.length).padStart(2, "0");
        activeAssignments.textContent = String(active).padStart(2, "0");
    }

    // Open and close modal
    document.getElementById("openAssignmentForm").addEventListener("click", function () {
        modal.classList.add("show");
    });

    document.getElementById("closeAssignmentForm").addEventListener("click", function () {
        modal.classList.remove("show");
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.classList.remove("show");
        }
    });

    // Search and filter assignments
    function filterAssignments() {

        const searchValue = search.value.toLowerCase().trim();
        const selectedCourse = courseFilter.value;
        const selectedStatus = statusFilter.value;

        const cards = Array.from(grid.querySelectorAll(".assignment-card"));
        let visible = 0;

        cards.forEach(card => {

            const matchesText = card.textContent.toLowerCase().includes(searchValue);
            const matchesCourse =
                selectedCourse === "all" || card.dataset.course === selectedCourse;
            const matchesStatus =
                selectedStatus === "all" || card.dataset.status === selectedStatus;

            const show = matchesText && matchesCourse && matchesStatus;

            card.style.display = show ? "" : "none";

            if (show) visible++;
        });

        document.getElementById("assignmentEmpty").style.display =
            visible === 0 ? "block" : "none";
    }

    search.addEventListener("input", filterAssignments);
    courseFilter.addEventListener("change", filterAssignments);
    statusFilter.addEventListener("change", filterAssignments);

    // Create new assignment
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const title = titleInput.value.trim();
        const course = courseInput.value;
        const description = descriptionInput.value.trim();
        const dueDate = dueInput.value;
        const marks = Number(marksInput.value);

        if (!title || !course || !description || !dueDate || marks < 1) {
            alert("Please complete all assignment details.");
            return;
        }

        const formattedDate = new Date(dueDate + "T00:00:00")
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

        const card = document.createElement("article");
        card.className = "assignment-card";
        card.dataset.course = course;
        card.dataset.status = "Active";

        const top = document.createElement("div");
        top.className = "assignment-card-top";

        const category = document.createElement("span");
        category.className = "assignment-category";
        category.textContent = "NEW ASSIGNMENT";

        const status = document.createElement("span");
        status.className = "assignment-status active";
        status.textContent = "Active";

        top.append(category, status);

        const heading = document.createElement("h3");
        heading.textContent = title;

        const courseText = document.createElement("p");
        courseText.className = "assignment-course";
        courseText.textContent = course;

        const descriptionText = document.createElement("div");
        descriptionText.className = "assignment-description";
        descriptionText.textContent = description;

        const meta = document.createElement("div");
        meta.className = "assignment-meta";

        const due = document.createElement("span");
        due.textContent = "Due: " + formattedDate;

        const marksText = document.createElement("span");
        marksText.textContent = marks + " Marks";

        meta.append(due, marksText);

        const reviewButton = document.createElement("button");
        reviewButton.className = "assignment-review-button";
        reviewButton.textContent = "Review Submissions";
        reviewButton.addEventListener("click", function () {
            alert("Submission review will be available when the backend is connected.");
        });

        card.append(top, heading, courseText, descriptionText, meta, reviewButton);

        grid.prepend(card);

        form.reset();
        modal.classList.remove("show");

        updateStats();
        filterAssignments();

        alert("Assignment created successfully!");
    });

    // Demo review action for sample assignments
    grid.addEventListener("click", function (event) {
        const button = event.target.closest(".assignment-review-button");

        if (!button) return;

        alert("Submission review will be available when the backend is connected.");
    });

    // Initial setup
    updateStats();
    filterAssignments();

});


/* =========================================
   CAMPUSIQ - GRADES PAGE JAVASCRIPT
========================================= */

(() => {
    const gradesPage = document.querySelector(".grades-page");

    if (!gradesPage) return;

    const tableBody = document.getElementById("gradesTableBody");
    const searchInput = document.getElementById("gradeSearch");
    const courseFilter = document.getElementById("courseFilter");
    const gradeFilter = document.getElementById("gradeFilter");

    const modal = document.getElementById("gradeModal");
    const addButton = document.getElementById("addGradeBtn");
    const closeButton = document.getElementById("closeGradeModal");
    const form = document.getElementById("gradeForm");

    const studentName = document.getElementById("studentName");
    const studentId = document.getElementById("studentId");
    const studentCourse = document.getElementById("studentCourse");
    const marksObtained = document.getElementById("marksObtained");
    const totalMarks = document.getElementById("totalMarks");
    const modalTitle = document.getElementById("gradeModalTitle");

    let editingRow = null;

    function calculateGrade(percentage) {
        if (percentage >= 85) return "A";
        if (percentage >= 70) return "B";
        if (percentage >= 60) return "C";
        if (percentage >= 50) return "D";
        return "F";
    }

    function getGradeClass(grade) {
        return "grade-" + grade.toLowerCase();
    }

    function updateStatistics() {
        const rows = [...tableBody.querySelectorAll("tr")]
            .filter(row => !row.dataset.empty);

        const total = rows.length;

        const percentages = rows.map(row =>
            Number(row.dataset.percentage)
        );

        const average = total
            ? percentages.reduce((sum, value) => sum + value, 0) / total
            : 0;

        const topPerformers = percentages.filter(value => value >= 85).length;
        const needsImprovement = percentages.filter(value => value < 50).length;

        document.getElementById("totalStudents").textContent = total;
        document.getElementById("classAverage").textContent =
            average.toFixed(1) + "%";
        document.getElementById("topPerformers").textContent = topPerformers;
        document.getElementById("needsImprovement").textContent = needsImprovement;
    }

    function getRowData(row) {
        return {
            name: row.cells[0].textContent,
            id: row.cells[1].textContent,
            course: row.cells[2].textContent,
            marks: row.dataset.marks,
            total: row.dataset.total
        };
    }

    function createGradeRow(data) {
        const percentage = (data.marks / data.total) * 100;
        const grade = calculateGrade(percentage);

        const row = document.createElement("tr");

        row.dataset.marks = data.marks;
        row.dataset.total = data.total;
        row.dataset.percentage = percentage.toFixed(2);
        row.dataset.grade = grade;

        const values = [
            data.name,
            data.id,
            data.course,
            `${data.marks} / ${data.total}`,
            `${percentage.toFixed(1)}%`
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const gradeCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = `grade-badge ${getGradeClass(grade)}`;
        badge.textContent = grade;

        gradeCell.appendChild(badge);
        row.appendChild(gradeCell);

        const actionCell = document.createElement("td");
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-grade-btn";
        editButton.textContent = "Edit";

        actionCell.appendChild(editButton);
        row.appendChild(actionCell);

        return row;
    }

    function applyFilters() {
        const search = searchInput.value.trim().toLowerCase();
        const selectedCourse = courseFilter.value;
        const selectedGrade = gradeFilter.value;

        let visibleRows = 0;

        [...tableBody.querySelectorAll("tr")].forEach(row => {
            if (row.dataset.empty) return;

            const name = row.cells[0].textContent.toLowerCase();
            const id = row.cells[1].textContent.toLowerCase();
            const course = row.cells[2].textContent;
            const grade = row.dataset.grade;

            const matchesSearch =
                name.includes(search) || id.includes(search);

            const matchesCourse =
                selectedCourse === "all" || course === selectedCourse;

            const matchesGrade =
                selectedGrade === "all" || grade === selectedGrade;

            const visible =
                matchesSearch && matchesCourse && matchesGrade;

            row.style.display = visible ? "" : "none";

            if (visible) visibleRows++;
        });

        const emptyRow = tableBody.querySelector("[data-empty='true']");

        if (emptyRow) emptyRow.remove();

        if (visibleRows === 0) {
            const row = document.createElement("tr");
            row.dataset.empty = "true";

            const cell = document.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "No matching student records found.";
            cell.style.textAlign = "center";
            cell.style.padding = "25px";

            row.appendChild(cell);
            tableBody.appendChild(row);
        }
    }

    function openModal(row = null) {
        editingRow = row;

        form.reset();
        totalMarks.value = 100;

        if (row) {
            const data = getRowData(row);

            modalTitle.textContent = "Edit Student Grade";
            studentName.value = data.name;
            studentId.value = data.id;
            studentCourse.value = data.course;
            marksObtained.value = data.marks;
            totalMarks.value = data.total;
        } else {
            modalTitle.textContent = "Add Student Grade";
        }

        modal.classList.add("show");
        studentName.focus();
    }

    function closeModal() {
        modal.classList.remove("show");
        editingRow = null;
        form.reset();
    }

    addButton.addEventListener("click", () => openModal());

    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });

    tableBody.addEventListener("click", event => {
        const button = event.target.closest(".edit-grade-btn");

        if (!button) return;

        const row = button.closest("tr");

        if (row) openModal(row);
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = studentName.value.trim();
        const id = studentId.value.trim();
        const course = studentCourse.value;
        const marks = Number(marksObtained.value);
        const total = Number(totalMarks.value);

        if (!name || !id || !course) {
            alert("Please complete all student details.");
            return;
        }

        if (
            !Number.isFinite(marks) ||
            !Number.isFinite(total) ||
            total <= 0 ||
            marks < 0 ||
            marks > total
        ) {
            alert("Please enter valid marks. Obtained marks cannot exceed total marks.");
            return;
        }

        const duplicate = [...tableBody.querySelectorAll("tr")]
            .some(row =>
                row !== editingRow &&
                !row.dataset.empty &&
                row.cells[1].textContent.trim().toLowerCase() === id.toLowerCase() &&
                row.cells[2].textContent === course
            );

        if (duplicate) {
            alert("This student already has a grade record for this course.");
            return;
        }

        const data = { name, id, course, marks, total };
        const newRow = createGradeRow(data);

        if (editingRow) {
            editingRow.replaceWith(newRow);
        } else {
            tableBody.appendChild(newRow);
        }

        closeModal();
        updateStatistics();
        applyFilters();

        alert("Student grade saved successfully!");
    });

    searchInput.addEventListener("input", applyFilters);
    courseFilter.addEventListener("change", applyFilters);
    gradeFilter.addEventListener("change", applyFilters);

    // Prepare the original sample rows for calculations.
    [...tableBody.querySelectorAll("tr")].forEach(row => {
        if (row.dataset.empty) return;

        const marksText = row.cells[3].textContent;
        const match = marksText.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);

        if (!match) return;

        const marks = Number(match[1]);
        const total = Number(match[2]);
        const percentage = (marks / total) * 100;
        const grade = calculateGrade(percentage);

        row.dataset.marks = marks;
        row.dataset.total = total;
        row.dataset.percentage = percentage.toFixed(2);
        row.dataset.grade = grade;

        const badge = row.querySelector(".grade-badge");

        if (badge) {
            badge.className = `grade-badge ${getGradeClass(grade)}`;
            badge.textContent = grade;
        }

        row.cells[4].textContent = percentage.toFixed(1) + "%";
    });

    updateStatistics();
})();


/* =====================================
   CAMPUSIQ – FACULTY TIMETABLE
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    const timetablePage = document.querySelector(".timetable-page");

    if (!timetablePage) return;

    const timetableBody = document.getElementById("timetableBody");
    const dayFilters = document.querySelectorAll(".day-filter");
    const printButton = document.getElementById("printTimetableBtn");

    if (!timetableBody) return;

    const timetableRows = Array.from(timetableBody.querySelectorAll("tr"));

    // DAY-WISE TIMETABLE FILTER
    dayFilters.forEach(button => {

        button.addEventListener("click", function () {

            const selectedDay = this.dataset.day;

            dayFilters.forEach(filter => {
                filter.classList.remove("active");
            });

            this.classList.add("active");

            timetableRows.forEach(row => {

                const rowDay = row.dataset.day;

                if (selectedDay === "all" || rowDay === selectedDay) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }

            });

        });

    });

    // UPDATE WEEKLY CLASS COUNT
    const weeklyClasses = document.getElementById("weeklyClasses");

    if (weeklyClasses) {
        weeklyClasses.textContent = timetableRows.length;
    }

    // UPDATE ASSIGNED COURSE COUNT
    const assignedCourses = document.getElementById("assignedCourses");

    if (assignedCourses) {

        const courses = timetableRows
            .map(row => row.dataset.course)
            .filter(Boolean);

        assignedCourses.textContent = new Set(courses).size;
    }

    // UPDATE CLASSROOM COUNT
    const classrooms = document.getElementById("classrooms");

    if (classrooms) {

        const rooms = timetableRows
            .map(row => row.dataset.room)
            .filter(Boolean);

        classrooms.textContent = new Set(rooms).size;
    }

    // PRINT TIMETABLE
    if (printButton) {

        printButton.addEventListener("click", function () {
            window.print();
        });

    }

});


/* =========================================
   CAMPUSIQ – ANNOUNCEMENTS PAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const page = document.querySelector(".announcements-page");

    if (!page) return;

    const announcementList = document.getElementById("announcementList");
    const searchInput = document.getElementById("announcementSearch");
    const categoryFilter = document.getElementById("announcementCategory");

    const totalElement = document.getElementById("totalAnnouncements");
    const importantElement = document.getElementById("importantAnnouncements");
    const recentElement = document.getElementById("recentAnnouncements");
    const emptyMessage = document.getElementById("announcementEmpty");

    if (!announcementList) return;

    const cards = Array.from(
        announcementList.querySelectorAll(".announcement-card")
    );

    // UPDATE ANNOUNCEMENT STATISTICS
    function updateStatistics() {

        const total = cards.length;

        const important = cards.filter(card =>
            card.dataset.important === "true"
        ).length;

        const recent = cards.filter(card => {
            const dateText = card.querySelector(".announcement-meta span:last-child")
                ?.textContent.trim();

            if (!dateText) return false;

            const dateMatch = dateText.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);

            if (!dateMatch) return false;

            const date = new Date(
                `${dateMatch[2]} ${dateMatch[1]}, ${dateMatch[3]}`
            );

            const today = new Date();
            today.setHours(23, 59, 59, 999);

            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            return date >= sevenDaysAgo && date <= today;
        }).length;

        if (totalElement) totalElement.textContent = total;
        if (importantElement) importantElement.textContent = important;
        if (recentElement) recentElement.textContent = recent;
    }

    // SEARCH AND CATEGORY FILTER
    function filterAnnouncements() {

        const searchText = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        const selectedCategory = categoryFilter
            ? categoryFilter.value
            : "all";

        let visibleCount = 0;

        cards.forEach(card => {

            const category = card.dataset.category;

            const searchableText = card.textContent.toLowerCase();

            const matchesSearch = searchableText.includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;

            const shouldShow = matchesSearch && matchesCategory;

            card.style.display = shouldShow ? "" : "none";

            if (shouldShow) visibleCount++;

        });

        if (emptyMessage) {
            emptyMessage.hidden = visibleCount !== 0;
        }
    }

    // SEARCH EVENT
    if (searchInput) {
        searchInput.addEventListener("input", filterAnnouncements);
    }

    // CATEGORY FILTER EVENT
    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterAnnouncements);
    }

    // INITIALIZE PAGE
    updateStatistics();
    filterAnnouncements();

});

/* =========================================
   CAMPUSIQ – EVENTS PAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const page = document.querySelector(".events-page");

    if (!page) return;

    const eventsGrid = document.getElementById("eventsGrid");
    const searchInput = document.getElementById("eventSearch");
    const categoryFilter = document.getElementById("eventCategory");
    const statusFilter = document.getElementById("eventStatus");

    const totalEvents = document.getElementById("totalEvents");
    const upcomingEvents = document.getElementById("upcomingEvents");
    const completedEvents = document.getElementById("completedEvents");
    const emptyMessage = document.getElementById("eventsEmpty");

    if (!eventsGrid) return;

    const eventCards = Array.from(
        eventsGrid.querySelectorAll(".event-card")
    );

    // UPDATE EVENT STATISTICS
    function updateEventStatistics() {

        const total = eventCards.length;

        const upcoming = eventCards.filter(card =>
            card.dataset.status === "upcoming"
        ).length;

        const completed = eventCards.filter(card =>
            card.dataset.status === "completed"
        ).length;

        if (totalEvents) {
            totalEvents.textContent = total;
        }

        if (upcomingEvents) {
            upcomingEvents.textContent = upcoming;
        }

        if (completedEvents) {
            completedEvents.textContent = completed;
        }
    }

    // FILTER EVENTS
    function filterEvents() {

        const searchText = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        const selectedCategory = categoryFilter
            ? categoryFilter.value
            : "all";

        const selectedStatus = statusFilter
            ? statusFilter.value
            : "all";

        let visibleCount = 0;

        eventCards.forEach(card => {

            const category = card.dataset.category;
            const status = card.dataset.status;

            const eventText = card.textContent.toLowerCase();

            const matchesSearch =
                eventText.includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;

            const matchesStatus =
                selectedStatus === "all" ||
                status === selectedStatus;

            const shouldShow =
                matchesSearch &&
                matchesCategory &&
                matchesStatus;

            card.style.display = shouldShow ? "" : "none";

            if (shouldShow) {
                visibleCount++;
            }

        });

        if (emptyMessage) {
            emptyMessage.hidden = visibleCount !== 0;
        }
    }

    // SEARCH EVENTS
    if (searchInput) {
        searchInput.addEventListener("input", filterEvents);
    }

    // CATEGORY FILTER
    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterEvents);
    }

    // STATUS FILTER
    if (statusFilter) {
        statusFilter.addEventListener("change", filterEvents);
    }

    // INITIALIZE
    updateEventStatistics();
    filterEvents();

});



/* ==========================================
   CAMPUSIQ - LEAVE MANAGEMENT
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const leavePage = document.querySelector(".leave-page");

    // Run only on the Leave Management page
    if (!leavePage) return;

    const leaveForm = document.getElementById("leaveForm");
    const leaveTableBody = document.getElementById("leaveTableBody");
    const leaveSearch = document.getElementById("leaveSearch");
    const leaveStatusFilter = document.getElementById("leaveStatusFilter");
    const leaveEmpty = document.getElementById("leaveEmpty");

    const availableLeaves = document.getElementById("availableLeaves");
    const pendingLeaves = document.getElementById("pendingLeaves");
    const approvedLeaves = document.getElementById("approvedLeaves");
    const rejectedLeaves = document.getElementById("rejectedLeaves");

    if (!leaveForm || !leaveTableBody) return;

    // Calculate leave statistics
    function updateLeaveStatistics() {
        const rows = [...leaveTableBody.querySelectorAll("tr")];

        let pending = 0;
        let approved = 0;
        let rejected = 0;

        rows.forEach(row => {
            const status = row.dataset.status;

            if (status === "Pending") pending++;
            if (status === "Approved") approved++;
            if (status === "Rejected") rejected++;
        });

        if (pendingLeaves) pendingLeaves.textContent = pending;
        if (approvedLeaves) approvedLeaves.textContent = approved;
        if (rejectedLeaves) rejectedLeaves.textContent = rejected;

        // Sample balance: 12 days initially, reduced by approved requests
        const usedLeaves = rows
            .filter(row => row.dataset.status === "Approved")
            .reduce((total, row) => {
                const start = new Date(row.cells[1].textContent);
                const end = new Date(row.cells[2].textContent);

                const days = Math.round(
                    (end - start) / (1000 * 60 * 60 * 24)
                ) + 1;

                return total + (Number.isFinite(days) && days > 0 ? days : 0);
            }, 0);

        if (availableLeaves) {
            availableLeaves.textContent = Math.max(0, 12 - usedLeaves);
        }
    }

    // Filter leave history
    function filterLeaveRequests() {
        const searchText = leaveSearch.value.toLowerCase().trim();
        const selectedStatus = leaveStatusFilter.value;

        const rows = [...leaveTableBody.querySelectorAll("tr")];
        let visibleCount = 0;

        rows.forEach(row => {
            const matchesSearch = row.textContent
                .toLowerCase()
                .includes(searchText);

            const matchesStatus =
                selectedStatus === "all" ||
                row.dataset.status === selectedStatus;

            const show = matchesSearch && matchesStatus;

            row.style.display = show ? "" : "none";

            if (show) visibleCount++;
        });

        if (leaveEmpty) {
            leaveEmpty.hidden = visibleCount !== 0;
        }
    }

    // Create a new leave request
    leaveForm.addEventListener("submit", event => {
        event.preventDefault();

        const leaveType = document.getElementById("leaveType").value;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const reason = document.getElementById("leaveReason").value.trim();

        if (!leaveType || !startDate || !endDate || !reason) {
            alert("Please complete all leave application fields.");
            return;
        }

        const start = new Date(startDate + "T00:00:00");
        const end = new Date(endDate + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            alert("Please select today or a future date.");
            return;
        }

        if (end < start) {
            alert("The end date cannot be before the start date.");
            return;
        }

        const daysRequested =
            Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const currentBalance = Number(availableLeaves.textContent);

        if (daysRequested > currentBalance) {
            alert("Your sample leave balance is not sufficient.");
            return;
        }

        const row = document.createElement("tr");
        row.dataset.status = "Pending";

        const values = [
            leaveType,
            startDate,
            endDate,
            reason
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.className = "leave-status pending";
        statusBadge.textContent = "Pending";

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        leaveTableBody.prepend(row);

        leaveForm.reset();

        updateLeaveStatistics();
        filterLeaveRequests();

        alert("Your leave request has been submitted successfully!");
    });

    // Search and status filter
    leaveSearch.addEventListener("input", filterLeaveRequests);
    leaveStatusFilter.addEventListener("change", filterLeaveRequests);

    // Initial page setup
    updateLeaveStatistics();
    filterLeaveRequests();
});


/* ==========================================
   CAMPUSIQ - FACULTY PROFILE
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const profilePage = document.querySelector(".profile-page");

    // Run only on the profile page
    if (!profilePage) return;

    const profileForm = document.getElementById("profileForm");
    const editButton = document.getElementById("editProfileBtn");
    const cancelButton = document.getElementById("cancelEditBtn");
    const actions = document.getElementById("profileActions");

    if (!profileForm || !editButton || !cancelButton || !actions) return;

    const fields = [
        "fullName",
        "email",
        "phone",
        "dateOfBirth",
        "gender",
        "address",
        "facultyId",
        "designation",
        "department",
        "qualification",
        "experience",
        "joiningDate"
    ];

    let originalValues = {};

    const storageKey = "campusiqFacultyProfile";

    function getProfileValues() {
        const values = {};

        fields.forEach(id => {
            const field = document.getElementById(id);
            if (field) values[id] = field.value;
        });

        return values;
    }

    function updateProfileHeader() {
        const name = document.getElementById("fullName").value;
        const designation = document.getElementById("designation").value;
        const department = document.getElementById("department").value;
        const facultyId = document.getElementById("facultyId").value;

        document.getElementById("displayName").textContent =
            name || "Faculty Member";

        document.getElementById("displayDesignation").textContent =
            designation || "Faculty Member";

        document.getElementById("displayDepartment").textContent =
            department || "Department not specified";

        document.getElementById("displayFacultyId").textContent =
            facultyId || "Not assigned";

        document.getElementById("profileAvatar").textContent =
            (name.trim().charAt(0) || "F").toUpperCase();
    }

    function setEditing(enabled) {
        fields.forEach(id => {
            const field = document.getElementById(id);

            if (field && id !== "facultyId") {
                field.disabled = !enabled;
            }
        });

        editButton.hidden = enabled;
        actions.hidden = !enabled;
    }

    // Load saved profile information
    function loadProfile() {
        try {
            const savedData = localStorage.getItem(storageKey);

            if (savedData) {
                const values = JSON.parse(savedData);

                fields.forEach(id => {
                    const field = document.getElementById(id);

                    if (field && Object.prototype.hasOwnProperty.call(values, id)) {
                        field.value = values[id];
                    }
                });
            }
        } catch (error) {
            console.error("Unable to load profile information:", error);
        }

        updateProfileHeader();
    }

    // Start editing
    editButton.addEventListener("click", () => {
        originalValues = getProfileValues();
        setEditing(true);
    });

    // Save changes
    profileForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!profileForm.reportValidity()) return;

        const updatedValues = getProfileValues();

        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify(updatedValues)
            );

            updateProfileHeader();
            setEditing(false);

            alert("Profile information saved successfully!");
        } catch (error) {
            alert("Unable to save profile information in this browser.");
            console.error(error);
        }
    });

    // Cancel editing
    cancelButton.addEventListener("click", () => {
        fields.forEach(id => {
            const field = document.getElementById(id);

            if (field && Object.prototype.hasOwnProperty.call(originalValues, id)) {
                field.value = originalValues[id];
            }
        });

        updateProfileHeader();
        setEditing(false);
    });

    // Initial setup
    loadProfile();
    setEditing(false);
});
  /* ==========================================
   FACULTY COURSES - DATABASE CONNECTION
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const coursePage = document.querySelector(".courses-panel");

    if (!coursePage) return;

    const courseGrid = document.getElementById("courseGrid");
    const courseCount = document.getElementById("courseCount");
    const searchInput = document.getElementById("courseSearch");
    const noCoursesMessage = document.getElementById("noCoursesMessage");

    if (!courseGrid) return;

    try {

        const courses = await campusIQRequest("/courses");

        courseGrid.innerHTML = "";

        if (courseCount) {
            courseCount.textContent = String(courses.length).padStart(2, "0");
        }

        courses.forEach(course => {

            const card = document.createElement("article");
            card.className = "course-card";

            card.innerHTML = `
                <div class="course-card-top">
                    <span class="course-code">${course.code}</span>
                    <span class="status-active">Active</span>
                </div>

                <div class="course-icon">⌘</div>

                <h3>${course.title}</h3>

                <p class="course-department">${course.department}</p>

                <div class="course-details">
                    <span>♙ ${course.students} Students</span>
                    <span>${course.credits} Credits</span>
                </div>

                <div class="course-footer">
                    <span>Semester ${course.semester}</span>
                    <a href="attendance.html">Manage Course →</a>
                </div>
            `;

            courseGrid.appendChild(card);

        });

        if (searchInput) {
            searchInput.dispatchEvent(new Event("input"));
        }

        if (noCoursesMessage) {
            noCoursesMessage.hidden = courses.length !== 0;
        }

    } catch (error) {
        console.error("Unable to load courses:", error);
    }

});

/* ==========================================
   FACULTY ATTENDANCE - DATABASE CONNECTION
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const tableBody = document.getElementById("attendanceTableBody");

    if (!tableBody) return;

    const presentCount = document.getElementById("presentCount");
    const absentCount = document.getElementById("absentCount");
    const attendanceRate = document.getElementById("attendanceRate");
    const courseFilter = document.getElementById("courseFilter");
    const statusFilter = document.getElementById("statusFilter");
    const searchInput = document.getElementById("attendanceSearch");
    const emptyMessage = document.getElementById("attendanceEmpty");
    const resultCount = document.getElementById("attendanceResultCount");
    const resetButton = document.getElementById("resetAttendance");

    let attendanceRecords = [];

    function renderAttendance() {

        const course = courseFilter?.value || "all";
        const status = statusFilter?.value || "all";
        const search = searchInput?.value.toLowerCase().trim() || "";

        const filtered = attendanceRecords.filter(record => {
            const matchesCourse = course === "all" || record.course === course;
            const matchesStatus = status === "all" || record.status === status;
            const matchesSearch =
                record.student_name.toLowerCase().includes(search) ||
                record.student_id.toLowerCase().includes(search);

            return matchesCourse && matchesStatus && matchesSearch;
        });

        tableBody.innerHTML = "";

        filtered.forEach(record => {

            const row = document.createElement("tr");
            row.dataset.course = record.course;

            const statusClass = record.status.toLowerCase() === "present"
                ? "present"
                : "absent";

            row.innerHTML = `
                <td>${record.student_id}</td>
                <td>${record.student_name}</td>
                <td>${record.course}</td>
                <td>
                    <span class="attendance-status ${statusClass}">
                        ${record.status}
                    </span>
                </td>
                <td>
                    <button class="attendance-action" disabled>
                        Change Status
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        if (emptyMessage) {
            emptyMessage.style.display = filtered.length ? "none" : "block";
        }

        if (resultCount) {
            resultCount.textContent =
                `Showing ${filtered.length} student records`;
        }
    }

    try {

        attendanceRecords = await campusIQRequest("/attendance");

        const present = attendanceRecords.filter(
            record => record.status.toLowerCase() === "present"
        ).length;

        const absent = attendanceRecords.filter(
            record => record.status.toLowerCase() === "absent"
        ).length;

        if (presentCount) presentCount.textContent = present;
        if (absentCount) absentCount.textContent = absent;

        if (attendanceRate) {
            const total = present + absent;
            attendanceRate.textContent =
                total ? `${((present / total) * 100).toFixed(1)}%` : "0%";
        }

        renderAttendance();

        courseFilter?.addEventListener("change", renderAttendance);
        statusFilter?.addEventListener("change", renderAttendance);
        searchInput?.addEventListener("input", renderAttendance);

        resetButton?.addEventListener("click", () => {
            if (courseFilter) courseFilter.value = "all";
            if (statusFilter) statusFilter.value = "all";
            if (searchInput) searchInput.value = "";
            renderAttendance();
        });

    } catch (error) {
        console.error("Attendance loading failed:", error);
    }

});

/* ==========================================
   FACULTY ASSIGNMENTS - DATABASE CONNECTION
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const assignmentGrid = document.getElementById("assignmentGrid");

    if (!assignmentGrid) return;

    const totalAssignments = document.getElementById("totalAssignments");
    const activeAssignments = document.getElementById("activeAssignments");
    const totalSubmissions = document.getElementById("totalSubmissions");
    const pendingReviews = document.getElementById("pendingReviews");

    const searchInput = document.getElementById("assignmentSearch");
    const courseFilter = document.getElementById("assignmentCourseFilter");
    const statusFilter = document.getElementById("assignmentStatusFilter");
    const emptyMessage = document.getElementById("assignmentEmpty");

    let assignments = [];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function getCategory(course) {
        const categories = {
            "Java Programming": "PROGRAMMING",
            "Data Structures": "COMPUTER SCIENCE",
            "Database Management": "DATABASE",
            "Web Technologies": "WEB DEVELOPMENT"
        };

        return categories[course] || "ACADEMIC TASK";
    }

    function renderAssignments() {

        const search = searchInput?.value.toLowerCase().trim() || "";
        const course = courseFilter?.value || "all";
        const status = statusFilter?.value || "all";

        const filtered = assignments.filter(item => {

            const matchesSearch =
                item.title.toLowerCase().includes(search) ||
                item.course.toLowerCase().includes(search);

            const matchesCourse =
                course === "all" || item.course === course;

            const matchesStatus =
                status === "all" || item.status === status;

            return matchesSearch && matchesCourse && matchesStatus;
        });

        assignmentGrid.innerHTML = filtered.map(item => {

            const submitted = Number(item.submissions) || 0;
            const total = Number(item.total_students) || 0;
            const progress = total > 0
                ? Math.min(100, (submitted / total) * 100)
                : 0;

            const statusClass =
                item.status.toLowerCase() === "active" ? "active" : "closed";

            const dueDate = new Date(item.due_date + "T00:00:00")
                .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });

            return `
                <article class="assignment-card"
                    data-course="${escapeHTML(item.course)}"
                    data-status="${escapeHTML(item.status)}">

                    <div class="assignment-card-top">
                        <span class="assignment-category">
                            ${getCategory(item.course)}
                        </span>
                        <span class="assignment-status ${statusClass}">
                            ${escapeHTML(item.status)}
                        </span>
                    </div>

                    <h3>${escapeHTML(item.title)}</h3>

                    <p class="assignment-course">
                        ${escapeHTML(item.course)}
                    </p>

                    <div class="assignment-description">
                        ${escapeHTML(item.description)}
                    </div>

                    <div class="assignment-progress">
                        <div>
                            <span>Submissions</span>
                            <strong>${submitted} / ${total}</strong>
                        </div>

                        <div class="progress-track">
                            <div style="width:${progress}%"></div>
                        </div>
                    </div>

                    <div class="assignment-meta">
                        <span>◷ Due: ${dueDate}</span>
                        <span>${Number(item.maximum_marks)} Marks</span>
                    </div>

                    <button class="assignment-review-button" disabled>
                        Review Submissions
                    </button>

                </article>
            `;
        }).join("");

        if (emptyMessage) {
            emptyMessage.style.display =
                filtered.length ? "none" : "block";
        }
    }

    try {

        assignments = await campusIQRequest("/assignments");

        const active = assignments.filter(
            item => item.status.toLowerCase() === "active"
        ).length;

        const submissions = assignments.reduce(
            (sum, item) => sum + Number(item.submissions || 0), 0
        );

        const pending = assignments.reduce(
            (sum, item) => sum + Math.max(
                0,
                Number(item.total_students || 0) -
                Number(item.submissions || 0)
            ), 0
        );

        if (totalAssignments) totalAssignments.textContent = assignments.length;
        if (activeAssignments) activeAssignments.textContent = active;
        if (totalSubmissions) totalSubmissions.textContent = submissions;
        if (pendingReviews) pendingReviews.textContent = pending;

        renderAssignments();

        searchInput?.addEventListener("input", renderAssignments);
        courseFilter?.addEventListener("change", renderAssignments);
        statusFilter?.addEventListener("change", renderAssignments);

    } catch (error) {
        console.error("Assignments loading failed:", error);
    }

});

/* ==========================================
   FACULTY GRADES - DATABASE CONNECTION
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const tableBody = document.getElementById("gradesTableBody");

    if (!tableBody) return;

    const totalStudents = document.getElementById("totalStudents");
    const classAverage = document.getElementById("classAverage");
    const topPerformers = document.getElementById("topPerformers");
    const needsImprovement = document.getElementById("needsImprovement");

    const searchInput = document.getElementById("gradeSearch");
    const courseFilter = document.getElementById("courseFilter");
    const gradeFilter = document.getElementById("gradeFilter");

    let gradeRecords = [];

    function getGrade(percentage) {
        if (percentage >= 85) return "A";
        if (percentage >= 70) return "B";
        if (percentage >= 60) return "C";
        if (percentage >= 50) return "D";
        return "F";
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function renderGrades() {

        const search = searchInput?.value.toLowerCase().trim() || "";
        const course = courseFilter?.value || "all";
        const selectedGrade = gradeFilter?.value || "all";

        const filtered = gradeRecords.filter(record => {

            const percentage = Number(record.total_marks) > 0
                ? (Number(record.marks) / Number(record.total_marks)) * 100
                : 0;

            const grade = getGrade(percentage);

            return (
                (record.student_name.toLowerCase().includes(search) ||
                 record.student_id.toLowerCase().includes(search)) &&
                (course === "all" || record.course === course) &&
                (selectedGrade === "all" || grade === selectedGrade)
            );
        });

        tableBody.innerHTML = filtered.map(record => {

            const marks = Number(record.marks);
            const total = Number(record.total_marks);
            const percentage = total > 0 ? (marks / total) * 100 : 0;
            const grade = getGrade(percentage);

            return `
                <tr>
                    <td>${escapeHTML(record.student_name)}</td>
                    <td>${escapeHTML(record.student_id)}</td>
                    <td>${escapeHTML(record.course)}</td>
                    <td>${marks} / ${total}</td>
                    <td>${percentage.toFixed(1)}%</td>
                    <td>
                        <span class="grade-badge grade-${grade.toLowerCase()}">
                            ${grade}
                        </span>
                    </td>
                    <td>
                        <button class="edit-grade-btn" disabled>
                            Edit
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    try {

        gradeRecords = await campusIQRequest("/grades");

        const percentages = gradeRecords.map(record =>
            Number(record.total_marks) > 0
                ? (Number(record.marks) / Number(record.total_marks)) * 100
                : 0
        );

        const average = percentages.length
            ? percentages.reduce((sum, value) => sum + value, 0) / percentages.length
            : 0;

        const topCount = percentages.filter(value => value >= 85).length;
        const improvementCount = percentages.filter(value => value < 50).length;

        if (totalStudents) totalStudents.textContent = gradeRecords.length;
        if (classAverage) classAverage.textContent = `${average.toFixed(1)}%`;
        if (topPerformers) topPerformers.textContent = topCount;
        if (needsImprovement) needsImprovement.textContent = improvementCount;

        renderGrades();

        searchInput?.addEventListener("input", renderGrades);
        courseFilter?.addEventListener("change", renderGrades);
        gradeFilter?.addEventListener("change", renderGrades);

    } catch (error) {
        console.error("Grades loading failed:", error);
    }

});

/* ==========================================
   FACULTY TIMETABLE - DATABASE CONNECTION
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const timetableBody = document.getElementById("timetableBody");

    if (!timetableBody) return;

    const weeklyClasses = document.getElementById("weeklyClasses");
    const teachingHours = document.getElementById("teachingHours");
    const assignedCourses = document.getElementById("assignedCourses");
    const classrooms = document.getElementById("classrooms");

    const dayButtons = document.querySelectorAll(".day-filter");

    let timetableRecords = [];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function calculateHours(start, end) {
        const [startHour, startMinute] = start.split(":").map(Number);
        const [endHour, endMinute] = end.split(":").map(Number);

        return (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60;
    }

    function renderTimetable(selectedDay = "all") {

        const filtered = timetableRecords.filter(record =>
            selectedDay === "all" || record.day === selectedDay
        );

        timetableBody.innerHTML = filtered.map(record => {

            const type = record.session_type || "Lecture";
            const typeClass = type.toLowerCase() === "practical"
                ? "lab"
                : type.toLowerCase() === "meeting"
                    ? "meeting"
                    : "lecture";

            return `
                <tr data-day="${escapeHTML(record.day)}">
                    <td><strong>${escapeHTML(record.day)}</strong></td>

                    <td>
                        ${escapeHTML(record.start_time)}
                        – ${escapeHTML(record.end_time)}
                    </td>

                    <td>
                        <strong>${escapeHTML(record.course)}</strong>
                        <small>${escapeHTML(record.course_code)}</small>
                    </td>

                    <td>III CSE – ${escapeHTML(record.section)}</td>

                    <td>${escapeHTML(record.classroom)}</td>

                    <td>
                        <span class="session-badge ${typeClass}">
                            ${escapeHTML(type)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    try {

        timetableRecords = await campusIQRequest("/timetable");

        const totalHours = timetableRecords.reduce(
            (sum, record) =>
                sum + calculateHours(record.start_time, record.end_time),
            0
        );

        const uniqueCourses = new Set(
            timetableRecords
                .filter(record => record.session_type !== "Meeting")
                .map(record => record.course)
        );

        const uniqueClassrooms = new Set(
            timetableRecords.map(record => record.classroom)
        );

        if (weeklyClasses) {
            weeklyClasses.textContent = timetableRecords.length;
        }

        if (teachingHours) {
            teachingHours.textContent = `${totalHours} hrs`;
        }

        if (assignedCourses) {
            assignedCourses.textContent = uniqueCourses.size;
        }

        if (classrooms) {
            classrooms.textContent = uniqueClassrooms.size;
        }

        renderTimetable();

        dayButtons.forEach(button => {

            button.addEventListener("click", () => {

                dayButtons.forEach(item =>
                    item.classList.remove("active")
                );

                button.classList.add("active");

                renderTimetable(button.dataset.day);
            });

        });

    } catch (error) {
        console.error("Timetable loading failed:", error);
    }

    // Print timetable
    document.getElementById("printTimetableBtn")
        ?.addEventListener("click", () => window.print());

});


/* ==========================================
   FACULTY ANNOUNCEMENTS - DATABASE CONNECTION
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const announcementList = document.getElementById("announcementList");

    if (!announcementList) return;

    const searchInput = document.getElementById("announcementSearch");
    const categoryFilter = document.getElementById("announcementCategory");
    const emptyMessage = document.getElementById("announcementEmpty");

    const totalElement = document.getElementById("totalAnnouncements");
    const importantElement = document.getElementById("importantAnnouncements");
    const recentElement = document.getElementById("recentAnnouncements");

    let announcements = [];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function formatDate(dateString) {
        if (!dateString) return "Date unavailable";

        const date = new Date(dateString + "T00:00:00");

        if (isNaN(date.getTime())) return escapeHTML(dateString);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    function getCategoryClass(category) {
        const value = category.toLowerCase();

        if (value === "events" || value === "event") return "event";
        if (value === "examination") return "examination";
        if (value === "general") return "general";

        return "academic";
    }

    function renderAnnouncements() {

        const searchText = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value.toLowerCase();

        const filtered = announcements.filter(item => {

            const matchesSearch =
                item.title.toLowerCase().includes(searchText) ||
                item.body.toLowerCase().includes(searchText) ||
                item.posted_by.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                item.category.toLowerCase() === selectedCategory ||
                (selectedCategory === "event" &&
                    item.category.toLowerCase() === "events");

            return matchesSearch && matchesCategory;
        });

        announcementList.querySelectorAll(".announcement-card")
            .forEach(card => card.remove());

        filtered.forEach(item => {

            const categoryClass = getCategoryClass(item.category);
            const important = item.priority.toLowerCase() === "important";
            const isNew = item.priority.toLowerCase() === "new update";

            const card = document.createElement("article");

            card.className = "announcement-card";
            card.dataset.category = categoryClass;
            card.dataset.important = String(important);

            card.innerHTML = `
                <div class="announcement-card-top">

                    <span class="announcement-category ${categoryClass}">
                        ${escapeHTML(item.category)}
                    </span>

                    ${important
                        ? `<span class="announcement-priority">★ Important</span>`
                        : isNew
                            ? `<span class="announcement-status">New Update</span>`
                            : ""
                    }

                </div>

                <h3>${escapeHTML(item.title)}</h3>

                <p>${escapeHTML(item.body)}</p>

                <div class="announcement-meta">
                    <span>▦ ${escapeHTML(item.posted_by)}</span>
                    <span>◷ ${formatDate(item.posted_date)}</span>
                </div>
            `;

            announcementList.insertBefore(card, emptyMessage);
        });

        emptyMessage.hidden = filtered.length !== 0;
    }

    try {

        announcements = await campusIQRequest("/announcements");

        totalElement.textContent = announcements.length;

        importantElement.textContent = announcements.filter(
            item => item.priority.toLowerCase() === "important"
        ).length;

        const recentCount = announcements.filter(item => {
            const date = new Date(item.posted_date + "T00:00:00");
            const today = new Date();
            const difference = (today - date) / (1000 * 60 * 60 * 24);

            return difference >= 0 && difference <= 7;
        }).length;

        recentElement.textContent = recentCount;

        renderAnnouncements();

        searchInput.addEventListener("input", renderAnnouncements);
        categoryFilter.addEventListener("change", renderAnnouncements);

    } catch (error) {
        console.error("Announcements loading failed:", error);
    }

});


/* ==========================================
   FACULTY EVENTS - DATABASE CONNECTION
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const eventsGrid = document.getElementById("eventsGrid");

    if (!eventsGrid) return;

    const searchInput = document.getElementById("eventSearch");
    const categoryFilter = document.getElementById("eventCategory");
    const statusFilter = document.getElementById("eventStatus");
    const emptyMessage = document.getElementById("eventsEmpty");

    const totalElement = document.getElementById("totalEvents");
    const upcomingElement = document.getElementById("upcomingEvents");
    const completedElement = document.getElementById("completedEvents");

    let events = [];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function formatEventDate(dateString) {
        const date = new Date(dateString + "T00:00:00");

        return {
            day: date.toLocaleDateString("en-IN", { day: "2-digit" }),
            month: date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()
        };
    }

    function getCategoryClass(category) {
        const value = category.toLowerCase();

        if (value === "technical") return "technical";
        if (value === "cultural") return "cultural";
        if (value === "sports") return "sports";

        return "academic";
    }

    function getCategoryIcon(category) {
        const icons = {
            technical: "⌘",
            academic: "▤",
            cultural: "✧",
            sports: "◎"
        };

        return icons[category.toLowerCase()] || "◇";
    }

    function renderEvents() {

        const searchText = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value.toLowerCase();
        const selectedStatus = statusFilter.value.toLowerCase();

        const filteredEvents = events.filter(event => {

            const matchesSearch =
                event.title.toLowerCase().includes(searchText) ||
                event.description.toLowerCase().includes(searchText) ||
                event.venue.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                event.category.toLowerCase() === selectedCategory;

            const matchesStatus =
                selectedStatus === "all" ||
                event.status.toLowerCase() === selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        eventsGrid.querySelectorAll(".event-card")
            .forEach(card => card.remove());

        filteredEvents.forEach(event => {

            const categoryClass = getCategoryClass(event.category);
            const date = formatEventDate(event.event_date);
            const status = event.status.toLowerCase();

            const card = document.createElement("article");

            card.className = "event-card";
            card.dataset.category = categoryClass;
            card.dataset.status = status;

            card.innerHTML = `
                <div class="event-card-banner ${categoryClass}-banner">
                    <span class="event-banner-icon">
                        ${getCategoryIcon(event.category)}
                    </span>
                    <span class="event-type-label">
                        ${escapeHTML(event.category.toUpperCase())}
                    </span>
                </div>

                <div class="event-card-content">

                    <div class="event-date">
                        <strong>${date.day}</strong>
                        <span>${date.month}</span>
                    </div>

                    <h3>${escapeHTML(event.title)}</h3>

                    <p>${escapeHTML(event.description)}</p>

                    <div class="event-details">
                        <span>◷ ${escapeHTML(event.event_time)}</span>
                        <span>⌖ ${escapeHTML(event.venue)}</span>
                    </div>

                    <div class="event-card-footer">
                        <span class="event-status ${status}">
                            ${escapeHTML(event.status)}
                        </span>
                        <span class="event-category-text">
                            ${escapeHTML(event.category)}
                        </span>
                    </div>

                </div>
            `;

            eventsGrid.insertBefore(card, emptyMessage);
        });

        emptyMessage.hidden = filteredEvents.length !== 0;
    }

    try {

        events = await campusIQRequest("/events");

        totalElement.textContent = events.length;

        upcomingElement.textContent = events.filter(
            event => event.status.toLowerCase() === "upcoming"
        ).length;

        completedElement.textContent = events.filter(
            event => event.status.toLowerCase() === "completed"
        ).length;

        renderEvents();

        searchInput.addEventListener("input", renderEvents);
        categoryFilter.addEventListener("change", renderEvents);
        statusFilter.addEventListener("change", renderEvents);

    } catch (error) {
        console.error("Events loading failed:", error);
    }

});


/* ==========================================
   FACULTY LEAVE MANAGEMENT - DATABASE
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const leaveTableBody = document.getElementById("leaveTableBody");

    if (!leaveTableBody) return;

    const leaveForm = document.getElementById("leaveForm");
    const searchInput = document.getElementById("leaveSearch");
    const statusFilter = document.getElementById("leaveStatusFilter");
    const emptyMessage = document.getElementById("leaveEmpty");

    const pendingElement = document.getElementById("pendingLeaves");
    const approvedElement = document.getElementById("approvedLeaves");
    const rejectedElement = document.getElementById("rejectedLeaves");

    let leaveRecords = [];

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function renderLeaveRecords() {

        const searchText = searchInput.value.toLowerCase().trim();
        const selectedStatus = statusFilter.value.toLowerCase();

        const filtered = leaveRecords.filter(leave => {

            const matchesSearch =
                leave.leave_type.toLowerCase().includes(searchText) ||
                leave.reason.toLowerCase().includes(searchText);

            const matchesStatus =
                selectedStatus === "all" ||
                leave.status.toLowerCase() === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        leaveTableBody.innerHTML = filtered.map(leave => {

            const statusClass = leave.status.toLowerCase();

            return `
                <tr data-status="${escapeHTML(statusClass)}">
                    <td>${escapeHTML(leave.leave_type)}</td>
                    <td>${escapeHTML(leave.start_date)}</td>
                    <td>${escapeHTML(leave.end_date)}</td>
                    <td>${escapeHTML(leave.reason)}</td>
                    <td>
                        <span class="leave-status ${escapeHTML(statusClass)}">
                            ${escapeHTML(leave.status)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");

        emptyMessage.hidden = filtered.length !== 0;
    }

    async function loadLeaveRecords() {

        leaveRecords = await campusIQRequest("/leaves");

        pendingElement.textContent = leaveRecords.filter(
            leave => leave.status.toLowerCase() === "pending"
        ).length;

        approvedElement.textContent = leaveRecords.filter(
            leave => leave.status.toLowerCase() === "approved"
        ).length;

        rejectedElement.textContent = leaveRecords.filter(
            leave => leave.status.toLowerCase() === "rejected"
        ).length;

        renderLeaveRecords();
    }

    try {
        await loadLeaveRecords();
    } catch (error) {
        console.error("Leave records loading failed:", error);
    }

    searchInput.addEventListener("input", renderLeaveRecords);
    statusFilter.addEventListener("change", renderLeaveRecords);

    // Submit a new leave application
    leaveForm.addEventListener("submit", async event => {

        event.preventDefault();

        const leaveType = document.getElementById("leaveType").value;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const reason = document.getElementById("leaveReason").value.trim();

        if (endDate < startDate) {
            alert("End date cannot be earlier than start date.");
            return;
        }

        const submitButton = leaveForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {

            await campusIQRequest("/leaves", {
                method: "POST",
                body: JSON.stringify({
                    leaveType,
                    startDate,
                    endDate,
                    reason
                })
            });

            alert("Leave request submitted successfully!");

            leaveForm.reset();
            await loadLeaveRecords();

        } catch (error) {
            console.error("Leave submission failed:", error);
            alert("Unable to submit leave request: " + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML =
                '<i class="fas fa-paper-plane"></i> Submit Request';
        }

    });

});


/* ==========================================
   FACULTY PROFILE - DATABASE CONNECTION
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("profileForm");
    if (!form) return;

    const editBtn = document.getElementById("editProfileBtn");
    const cancelBtn = document.getElementById("cancelEditBtn");
    const actions = document.getElementById("profileActions");

    const editableFields = [
        "fullName",
        "phone",
        "gender",
        "address",
        "designation",
        "department",
        "qualification",
        "experience"
    ];

    const allFields = [
        ...editableFields,
        "email",
        "dateOfBirth",
        "facultyId",
        "joiningDate"
    ];

    let originalProfile = {};

    function showProfile(profile) {

        allFields.forEach(field => {
            const input = document.getElementById(field);
            if (input) input.value = profile[field] ?? "";
        });

        document.getElementById("displayName").textContent =
            profile.fullName || "Faculty Member";

        document.getElementById("displayDesignation").textContent =
            profile.designation || "Faculty Member";

        document.getElementById("displayDepartment").textContent =
            profile.department || "Department";

        document.getElementById("displayFacultyId").textContent =
            profile.facultyId || "";

        document.getElementById("profileAvatar").textContent =
            (profile.fullName || "F").trim().charAt(0).toUpperCase();
    }

    function setEditMode(enabled) {

        editableFields.forEach(field => {
            document.getElementById(field).disabled = !enabled;
        });

        editBtn.hidden = enabled;
        actions.hidden = !enabled;
    }

    async function loadProfile() {

        const profile = await campusIQRequest("/profile");

        originalProfile = { ...profile };
        showProfile(profile);
    }

    editBtn.addEventListener("click", async () => {

        await loadProfile();
        setEditMode(true);

    });

    cancelBtn.addEventListener("click", () => {

        showProfile(originalProfile);
        setEditMode(false);

    });

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const updatedProfile = {};

        editableFields.forEach(field => {
            updatedProfile[field] =
                document.getElementById(field).value.trim();
        });

        const saveBtn = form.querySelector('button[type="submit"]');

        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        try {

            await campusIQRequest("/profile", {
                method: "PUT",
                body: JSON.stringify(updatedProfile)
            });

            await loadProfile();
            setEditMode(false);

            alert("Profile updated successfully!");

        } catch (error) {

            console.error("Profile update failed:", error);
            alert("Profile update failed: " + error.message);

        } finally {

            saveBtn.disabled = false;
            saveBtn.innerHTML =
                '<i class="fas fa-save"></i> Save Changes';

        }
    });

    try {
        await loadProfile();
        setEditMode(false);
    } catch (error) {
        console.error("Profile loading failed:", error);
        alert("Unable to load profile: " + error.message);
    }

});
