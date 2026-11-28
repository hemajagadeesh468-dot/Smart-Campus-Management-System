
/* =====================================================
   CAMPUSIQ - FACULTY PORTAL
   Complete Shared JavaScript
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

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
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const email = document.getElementById("facultyEmail");
            const password = document.getElementById("facultyPassword");

            if (!email || !password) return;

            if (!email.value.trim() || !password.value.trim()) {
                if (loginMessage) {
                    loginMessage.textContent =
                        "Please enter your email and password.";
                }
                return;
            }

            if (loginMessage) {
                loginMessage.textContent =
                    "Login form is ready. Connect your backend to verify your account.";
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
