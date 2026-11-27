
/* ==========================================
   STUDENT LOGIN
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("studentBackendLoginForm");

    if (!form) return;

    const email = document.getElementById("studentEmail");
    const password = document.getElementById("studentPassword");
    const toggle = document.getElementById("studentPasswordToggle");
    const message = document.getElementById("studentLoginMessage");
    const submitButton = form.querySelector(".admin-auth-submit");

    toggle.addEventListener("click", function () {
        const hidden = password.type === "password";
        password.type = hidden ? "text" : "password";
        toggle.textContent = hidden ? "Hide" : "Show";
    });

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = "Signing in...";
        message.textContent = "Connecting to CampusIQ server...";

        try {

            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: "include",
                body: new URLSearchParams({
                    email: email.value.trim(),
                    password: password.value
                })
            });

            const result = await response.text();

            if (response.ok) {

                window.location.href = "dashboard.html";

            } else {

                message.textContent = result || "Invalid student email or password.";
                submitButton.disabled = false;
                submitButton.innerHTML = 'Sign in to CampusIQ <span>→</span>';

            }

        } catch (error) {

            message.textContent = "Unable to connect to CampusIQ server.";
            submitButton.disabled = false;
            submitButton.innerHTML = 'Sign in to CampusIQ <span>→</span>';

        }

    });

});

/* =====================================================
   CAMPUSIQ - COMPLETE STUDENT PORTAL JAVASCRIPT
   ONE COMMON JAVASCRIPT FILE FOR ALL STUDENT PAGES
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    // =================================================
    // 1. COMMON UTILITIES
    // =================================================

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        Array.from(parent.querySelectorAll(selector));

    function showToast(message) {

        let toast = $(".toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.className = "toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(window.campusToastTimer);

        window.campusToastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    window.showToast = showToast;


    // =================================================
    // 2. LIGHT AND DARK THEME
    // =================================================

    const themeButton = $(".theme-button");

    const savedTheme = localStorage.getItem("campusiq-theme");

    if (savedTheme === "dark" || savedTheme === "light") {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    function updateThemeButton() {

        const theme =
            document.documentElement.getAttribute("data-theme") || "light";

        if (themeButton) {
            themeButton.textContent = theme === "dark" ? "☀️" : "🌙";

            themeButton.setAttribute(
                "aria-label",
                theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );
        }
    }

    updateThemeButton();

    if (themeButton) {

        themeButton.addEventListener("click", function () {

            const current =
                document.documentElement.getAttribute("data-theme") || "light";

            const next = current === "light" ? "dark" : "light";

            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem("campusiq-theme", next);

            updateThemeButton();

            showToast(next === "dark" ? "Dark mode enabled" : "Light mode enabled");
        });
    }


    // =================================================
    // 3. MOBILE SIDEBAR
    // =================================================

    const menuButton = $(".menu-button");
    const sidebar = $(".sidebar");

    if (menuButton && sidebar) {

        menuButton.setAttribute("aria-expanded", "false");

        menuButton.addEventListener("click", function () {

            const opened = sidebar.classList.toggle("open");

            menuButton.setAttribute("aria-expanded", String(opened));
        });

        document.addEventListener("click", function (event) {

            if (
                window.innerWidth <= 800 &&
                !sidebar.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {
                sidebar.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
            }
        });

        $$(".nav-link", sidebar).forEach(link => {

            link.addEventListener("click", function () {

                if (window.innerWidth <= 800) {
                    sidebar.classList.remove("open");
                    menuButton.setAttribute("aria-expanded", "false");
                }
            });
        });
    }


    // =================================================
    // 4. AUTOMATIC ACTIVE NAVIGATION
    // =================================================

    const currentPage = decodeURIComponent(
        window.location.pathname.split("/").pop()
    ).toLowerCase();

    $$(".nav-link").forEach(link => {

        const href = link.getAttribute("href");

        if (!href) return;

        const linkPage = decodeURIComponent(
            href.split("/").pop()
        ).toLowerCase();

        link.classList.toggle("active", linkPage === currentPage);
    });


    // =================================================
    // 5. CURRENT DATE
    // =================================================

    const todayDate = $("#todayDate");

    if (todayDate) {
        todayDate.textContent = new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    $$("[data-current-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });


    // =================================================
    // 6. DEMO ACTION BUTTONS
    // =================================================

    $$("[data-demo-action]").forEach(button => {

        button.addEventListener("click", function (event) {

            event.preventDefault();

            showToast(
                button.getAttribute("data-demo-action") ||
                "This feature will be available soon."
            );
        });
    });


    // =================================================
    // 7. ATTENDANCE PAGE
    // =================================================

    const attendanceTable = $(".attendance-table") ||
        $(".table-wrap table");

    if (attendanceTable && currentPage === "attendance.html") {

        const rows = $$("tbody tr", attendanceTable);

        let attendedTotal = 0;
        let classesTotal = 0;

        rows.forEach(row => {

            const cells = $$("td", row);

            if (cells.length < 6) return;

            const attended = Number(cells[1].textContent.trim());
            const total = Number(cells[2].textContent.trim());

            if (!Number.isFinite(attended) ||
                !Number.isFinite(total) ||
                total <= 0) return;

            const percentage = attended / total * 100;

            attendedTotal += attended;
            classesTotal += total;

            cells[3].textContent = percentage.toFixed(1) + "%";

            const progress = $(".progress > div", cells[4]);

            if (progress) {
                progress.style.width = percentage + "%";
            }

            const status = $(".status", cells[5]);

            if (status) {

                status.classList.remove("good", "warning", "danger");

                if (percentage >= 85) {
                    status.textContent = "Good";
                    status.classList.add("good");
                } else if (percentage >= 75) {
                    status.textContent = "Average";
                    status.classList.add("warning");
                } else {
                    status.textContent = "Low";
                    status.classList.add("danger");
                }
            }
        });

        const overall = classesTotal
            ? attendedTotal / classesTotal * 100
            : 0;

        $$(".stat-card").forEach(card => {

            const label = $(".stat-label", card);
            const number = $(".stat-number", card);

            if (!label || !number) return;

            const name = label.textContent.toLowerCase();

            if (name.includes("overall attendance")) {
                number.textContent = overall.toFixed(1) + "%";
            }

            if (name.includes("classes attended")) {
                number.textContent = attendedTotal;
            }

            if (name.includes("classes absent")) {
                number.textContent = classesTotal - attendedTotal;
            }
        });

        const heroScore = $(".attendance-hero-score strong");

        if (heroScore) {
            heroScore.textContent = overall.toFixed(1) + "%";
        }

        
        
    }


    // =================================================
    // 8. CALENDAR PAGE
    // =================================================

    const calendarGrid = $(".calendar-month-grid");
    const monthHeading = $(".monthly-calendar-header h2");
    const monthButtons = $$(".calendar-month-controls button");

    if (calendarGrid && monthHeading && monthButtons.length >= 2) {

        const monthNames = [
            "January", "February", "March", "April",
            "May", "June", "July", "August",
            "September", "October", "November", "December"
        ];

        const initialHeading = monthHeading.textContent.trim();

        let month = monthNames.findIndex(name =>
            initialHeading.toLowerCase().includes(name.toLowerCase())
        );

        let year = Number(initialHeading.match(/\d{4}/)?.[0]) || 2026;

        if (month < 0) month = new Date().getMonth();

        let selectedDate = null;

       
        const academicEvents = {

            // ================= 2026 =================

            "2026-01-05": {
                title: "New Year Academic Reopening",
                type: "event-date-campus",
                message: "College reopens for the new academic session"
            },
            "2026-01-12": {
                title: "National Youth Day",
                type: "event-date-campus",
                message: "Youth awareness programme"
            },
            "2026-01-20": {
                title: "Assignment Submission",
                type: "assignment-date",
                message: "Semester assignment deadline"
            },
            "2026-01-26": {
                title: "Republic Day",
                type: "event-date-campus",
                message: "Republic Day celebration"
            },

            "2026-02-05": {
                title: "Technical Workshop",
                type: "event-date-campus",
                message: "Hands-on technical workshop"
            },
            "2026-02-10": {
                title: "Internal Assessment",
                type: "exam-date",
                message: "Internal assessment examinations"
            },
            "2026-02-14": {
                title: "Cultural Day",
                type: "event-date-campus",
                message: "Student cultural activities"
            },
            "2026-02-25": {
                title: "Project Review",
                type: "assignment-date",
                message: "Mini project progress review"
            },

            "2026-03-05": {
                title: "Library Week",
                type: "event-date-campus",
                message: "Library activities and reading programme"
            },
            "2026-03-12": {
                title: "Model Examination",
                type: "exam-date",
                message: "Semester model examinations"
            },
            "2026-03-20": {
                title: "Project Submission",
                type: "assignment-date",
                message: "Final project submission"
            },
            "2026-03-27": {
                title: "Department Workshop",
                type: "event-date-campus",
                message: "Department technical workshop"
            },

            "2026-04-03": {
                title: "Semester Examination",
                type: "exam-date",
                message: "Semester examination begins"
            },
            "2026-04-10": {
                title: "Practical Examination",
                type: "exam-date",
                message: "Laboratory practical examinations"
            },
            "2026-04-18": {
                title: "Sports Meet",
                type: "event-date-campus",
                message: "Annual sports activities"
            },
            "2026-04-27": {
                title: "Semester Break",
                type: "event-date-campus",
                message: "Academic break"
            },

            "2026-05-04": {
                title: "Summer Semester Begins",
                type: "event-date-campus",
                message: "New academic schedule"
            },
            "2026-05-12": {
                title: "Result Announcement",
                type: "exam-date",
                message: "Semester results publication"
            },
            "2026-05-19": {
                title: "Registration Deadline",
                type: "assignment-date",
                message: "Semester registration deadline"
            },
            "2026-05-28": {
                title: "Student Orientation",
                type: "event-date-campus",
                message: "Academic orientation programme"
            },

            "2026-06-05": {
                title: "Environment Day",
                type: "event-date-campus",
                message: "Environmental awareness programme"
            },
            "2026-06-12": {
                title: "Assignment Deadline",
                type: "assignment-date",
                message: "First assignment submission"
            },
            "2026-06-19": {
                title: "Guest Lecture",
                type: "event-date-campus",
                message: "Industry expert guest lecture"
            },
            "2026-06-26": {
                title: "Internal Assessment",
                type: "exam-date",
                message: "First internal assessment"
            },

            "2026-07-06": {
                title: "New Semester Begins",
                type: "event-date-campus",
                message: "Regular semester classes begin"
            },
            "2026-07-14": {
                title: "Coding Competition",
                type: "event-date-campus",
                message: "Inter-department coding contest"
            },
            "2026-07-21": {
                title: "Assignment Submission",
                type: "assignment-date",
                message: "Subject assignment deadline"
            },
            "2026-07-30": {
                title: "Technical Seminar",
                type: "event-date-campus",
                message: "Emerging technology seminar"
            },

            "2026-08-05": {
                title: "Project Proposal",
                type: "assignment-date",
                message: "Project proposal submission"
            },
            "2026-08-12": {
                title: "Internal Assessment",
                type: "exam-date",
                message: "Second internal assessment"
            },
            "2026-08-15": {
                title: "Independence Day",
                type: "event-date-campus",
                message: "Independence Day celebration"
            },
            "2026-08-25": {
                title: "Science Exhibition",
                type: "event-date-campus",
                message: "Student innovation exhibition"
            },

            "2026-09-05": {
                title: "Teachers' Day",
                type: "event-date-campus",
                message: "Teachers' Day celebration"
            },
            "2026-09-11": {
                title: "Workshop on Data Science",
                type: "event-date-campus",
                message: "Practical data science workshop"
            },
            "2026-09-18": {
                title: "Assignment Submission",
                type: "assignment-date",
                message: "Mid-semester assignment deadline"
            },
            "2026-09-28": {
                title: "Model Examination",
                type: "exam-date",
                message: "Model examination begins"
            },

            "2026-10-02": {
                title: "Gandhi Jayanti",
                type: "event-date-campus",
                message: "Campus remembrance programme"
            },
            "2026-10-09": {
                title: "Project Demonstration",
                type: "assignment-date",
                message: "Project demonstration"
            },
            "2026-10-16": {
                title: "Technical Symposium",
                type: "event-date-campus",
                message: "Annual technical symposium"
            },
            "2026-10-26": {
                title: "Practical Assessment",
                type: "exam-date",
                message: "Practical assessment"
            },

            "2026-11-05": {
                title: "Diwali Celebration",
                type: "event-date-campus",
                message: "Campus festive celebration"
            },
            "2026-11-12": {
                title: "Internal Assessment",
                type: "exam-date",
                message: "Third internal assessment"
            },
            "2026-11-20": {
                title: "Final Project Submission",
                type: "assignment-date",
                message: "Semester project submission"
            },
            "2026-11-27": {
                title: "Placement Preparation",
                type: "event-date-campus",
                message: "Career guidance programme"
            },

            "2026-12-05": {
                title: "Semester Examination",
                type: "exam-date",
                message: "End semester examinations"
            },
            "2026-12-10": {
                title: "Practical Examination",
                type: "exam-date",
                message: "Practical examination schedule"
            },
            "2026-12-15": {
                title: "Internal Assessment",
                type: "exam-date",
                message: "Semester examination"
            },
            "2026-12-17": {
                title: "Project Submission",
                type: "assignment-date",
                message: "Final submission deadline"
            },
            "2026-12-23": {
                title: "Annual Day",
                type: "event-date-campus",
                message: "College cultural celebration"
            },
            "2026-12-30": {
                title: "Academic Year Review",
                type: "event-date-campus",
                message: "Academic progress review"
            },


            // ================= 2027 =================

            "2027-01-04": {
                title: "College Reopening",
                type: "event-date-campus",
                message: "Classes resume after semester break"
            },
            "2027-01-12": {
                title: "Youth Day",
                type: "event-date-campus",
                message: "Student leadership programme"
            },
            "2027-01-20": {
                title: "Assignment Submission",
                type: "assignment-date",
                message: "New semester assignment deadline"
            },
            "2027-01-26": {
                title: "Republic Day",
                type: "event-date-campus",
                message: "Republic Day celebration"
            },

            "2027-02-05": {
                title: "Technical Workshop",
                type: "event-date-campus",
                message: "Technical skill development"
            },
            "2027-02-12": {
                title: "Internal Assessment",
                type: "exam-date",
                message: "First internal assessment"
            },
            "2027-02-19": {
                title: "Cultural Fest",
                type: "event-date-campus",
                message: "Inter-department cultural programme"
            },
            "2027-02-25": {
                title: "Project Review",
                type: "assignment-date",
                message: "Project progress evaluation"
            },

            "2027-03-05": {
                title: "Library Week",
                type: "event-date-campus",
                message: "Reading and library activities"
            },
            "2027-03-12": {
                title: "Model Examination",
                type: "exam-date",
                message: "Semester model examinations"
            },
            "2027-03-19": {
                title: "Project Submission",
                type: "assignment-date",
                message: "Final project submission"
            },
            "2027-03-26": {
                title: "Department Fest",
                type: "event-date-campus",
                message: "Department-level celebration"
            },

            "2027-04-05": {
                title: "Semester Examination",
                type: "exam-date",
                message: "Semester examination begins"
            },
            "2027-04-12": {
                title: "Practical Examination",
                type: "exam-date",
                message: "Laboratory examination"
            },
            "2027-04-20": {
                title: "Sports Meet",
                type: "event-date-campus",
                message: "Annual sports activities"
            },
            "2027-04-28": {
                title: "Semester Break",
                type: "event-date-campus",
                message: "Academic break begins"
            },

            "2027-05-05": {
                title: "Semester Registration",
                type: "assignment-date",
                message: "Registration deadline"
            },
            "2027-05-12": {
                title: "Result Announcement",
                type: "exam-date",
                message: "Semester result publication"
            },
            "2027-05-20": {
                title: "Student Orientation",
                type: "event-date-campus",
                message: "New semester orientation"
            },
            "2027-05-28": {
                title: "Academic Planning",
                type: "event-date-campus",
                message: "Academic planning session"
            },

            "2027-06-05": {
                title: "Environment Day",
                type: "event-date-campus",
                message: "Campus environmental programme"
            },
            "2027-06-11": {
                title: "Assignment Deadline",
                type: "assignment-date",
                message: "First assignment submission"
            },
            "2027-06-18": {
                title: "Guest Lecture",
                type: "event-date-campus",
                message: "Industry expert session"
            },
            "2027-06-25": {
                title: "Internal Assessment",
                type: "exam-date",
                message: "First internal assessment"
            },

            "2027-07-05": {
                title: "Semester Begins",
                type: "event-date-campus",
                message: "Regular academic classes begin"
            },
            "2027-07-13": {
                title: "Coding Competition",
                type: "event-date-campus",
                message: "Campus coding competition"
            },
            "2027-07-21": {
                title: "Assignment Submission",
                type: "assignment-date",
                message: "Subject assignment deadline"
            },
            "2027-07-29": {
                title: "Technology Seminar",
                type: "event-date-campus",
                message: "Emerging technology seminar"
            },

            "2027-08-05": {
                title: "Project Proposal",
                type: "assignment-date",
                message: "Project proposal deadline"
            },
            "2027-08-12": {
                title: "Internal Assessment",
                type: "exam-date",
                message: "Second internal assessment"
            },
            "2027-08-15": {
                title: "Independence Day",
                type: "event-date-campus",
                message: "Independence Day celebration"
            },
            "2027-08-25": {
                title: "Science Exhibition",
                type: "event-date-campus",
                message: "Student innovation showcase"
            },

            "2027-09-05": {
                title: "Teachers' Day",
                type: "event-date-campus",
                message: "Teachers' Day celebration"
            },
            "2027-09-10": {
                title: "Technical Workshop",
                type: "event-date-campus",
                message: "Practical technical workshop"
            },
            "2027-09-18": {
                title: "Assignment Submission",
                type: "assignment-date",
                message: "Mid-semester assignment deadline"
            },
            "2027-09-27": {
                title: "Model Examination",
                type: "exam-date",
                message: "Model examination begins"
            },

            "2027-10-02": {
                title: "Gandhi Jayanti",
                type: "event-date-campus",
                message: "Campus remembrance programme"
            },
            "2027-10-08": {
                title: "Project Demonstration",
                type: "assignment-date",
                message: "Project demonstration"
            },
            "2027-10-16": {
                title: "Technical Symposium",
                type: "event-date-campus",
                message: "Annual technical symposium"
            },
            "2027-10-25": {
                title: "Practical Assessment",
                type: "exam-date",
                message: "Practical assessment"
            },

            "2027-11-05": {
                title: "Cultural Celebration",
                type: "event-date-campus",
                message: "Campus cultural activities"
            },
            "2027-11-12": {
                title: "Internal Assessment",
                type: "exam-date",
                message: "Third internal assessment"
            },
            "2027-11-20": {
                title: "Final Project Submission",
                type: "assignment-date",
                message: "Final semester project submission"
            },
            "2027-11-26": {
                title: "Placement Preparation",
                type: "event-date-campus",
                message: "Career guidance programme"
            },

            "2027-12-05": {
                title: "Semester Examination",
                type: "exam-date",
                message: "End semester examinations"
            },
            "2027-12-10": {
                title: "Practical Examination",
                type: "exam-date",
                message: "Practical examination"
            },
            "2027-12-17": {
                title: "Project Submission",
                type: "assignment-date",
                message: "Final project submission"
            },
            "2027-12-23": {
                title: "Annual Day",
                type: "event-date-campus",
                message: "Annual cultural celebration"
            },
            "2027-12-30": {
                title: "Year-End Review",
                type: "event-date-campus",
                message: "Academic year review"
            }

        };


        function renderCalendar() {

            monthHeading.innerHTML = "";

            monthHeading.appendChild(
                document.createTextNode(monthNames[month] + " ")
            );

            const yearSpan = document.createElement("span");
            yearSpan.textContent = year;
            monthHeading.appendChild(yearSpan);

            calendarGrid.innerHTML = "";

            ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
                .forEach(day => {

                    const heading = document.createElement("div");
                    heading.className = "calendar-day-name";
                    heading.textContent = day;

                    calendarGrid.appendChild(heading);
                });

            const firstDay = new Date(year, month, 1).getDay();
            const totalDays = new Date(year, month + 1, 0).getDate();
            const previousDays = new Date(year, month, 0).getDate();

            for (let i = firstDay - 1; i >= 0; i--) {
                createDateCell(previousDays - i, true);
            }

            for (let day = 1; day <= totalDays; day++) {
                createDateCell(day, false);
            }

            const remaining = (7 - calendarGrid.children.length % 7) % 7;

            for (let day = 1; day <= remaining; day++) {
                createDateCell(day, true);
            }

            updateSelectedDate();
        }

        function createDateCell(day, muted) {

            const cell = document.createElement("div");

            cell.className = "calendar-date";
            cell.textContent = day;

            if (muted) {
                cell.classList.add("muted-date");
                calendarGrid.appendChild(cell);
                return;
            }

            const dateKey =
                `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const event = academicEvents[dateKey];

            if (event) {

                cell.classList.add("event-date", event.type);

                const dot = document.createElement("span");
                cell.appendChild(dot);

                cell.title = event.title + " - " + event.message;
            }

            cell.setAttribute("role", "button");
            cell.setAttribute("tabindex", "0");

            cell.setAttribute(
                "aria-label",
                `${day} ${monthNames[month]} ${year}`
            );

            function selectDate() {

                selectedDate = dateKey;
                updateSelectedDate();

                showToast(
                    event
                        ? event.title + ": " + event.message
                        : `Selected ${day} ${monthNames[month]} ${year}`
                );
            }

            cell.addEventListener("click", selectDate);

            cell.addEventListener("keydown", event => {

                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectDate();
                }
            });

            calendarGrid.appendChild(cell);
        }

        function updateSelectedDate() {

            $$(".calendar-date", calendarGrid).forEach(cell => {
                cell.classList.remove("selected-calendar-date");
            });

            if (!selectedDate) return;

            const [selectedYear, selectedMonth, selectedDay] =
                selectedDate.split("-").map(Number);

            if (selectedYear !== year || selectedMonth !== month + 1) return;

            $$(".calendar-date:not(.muted-date)", calendarGrid)
                .forEach(cell => {

                    if (Number(cell.textContent) === selectedDay) {
                        cell.classList.add("selected-calendar-date");
                    }
                });
        }

        monthButtons[0].addEventListener("click", function () {

            month--;

            if (month < 0) {
                month = 11;
                year--;
            }

            selectedDate = null;
            renderCalendar();
        });

        monthButtons[1].addEventListener("click", function () {

            month++;

            if (month > 11) {
                month = 0;
                year++;
            }

            selectedDate = null;
            renderCalendar();
        });

        renderCalendar();
    }


    // =================================================
    // 9. RESULTS PAGE
    // =================================================

    const semesterPicker = $("#semesterPicker");

    if (semesterPicker) {

        const chips = $$(".semester-chip", semesterPicker);

        chips.forEach(chip => {

            chip.addEventListener("click", function () {

                chips.forEach(item => item.classList.remove("active"));

                chip.classList.add("active");

                const semester = chip.dataset.semester;

                const title = $("#marksheetTitle");
                const subtitle = $("#marksheetSubtitle");
                const caption = $("#summaryCaption");

                if (semester === "all") {

                    if (title) title.textContent = "Complete Academic Record";
                    if (subtitle) subtitle.textContent = "All available semester records";
                    if (caption) caption.textContent = "All semesters";

                } else {

                    if (title) title.textContent = "Semester " + semester + " Marksheet";
                    if (subtitle) subtitle.textContent = "Semester " + semester + " record preview";
                    if (caption) caption.textContent = "Semester " + semester;
                }

                showToast(
                    semester === "all"
                        ? "Showing all semester records"
                        : "Selected Semester " + semester
                );
            });
        });
    }

    // Export marksheet as CSV
    const downloadCsvButton = $("#downloadCsv");

    if (downloadCsvButton) {

        downloadCsvButton.addEventListener("click", function () {

            const table = $(".marksheet-table");

            if (!table) return;

            const data = [];

            $$("tr", table).forEach(row => {
                data.push($$("th, td", row).map(cell => cell.textContent.trim()));
            });

            downloadCSV(data, "CampusIQ_Scorecard.csv");

            showToast("Scorecard CSV downloaded!");
        });
    }

    // Print scorecard / save as PDF
    const downloadPdfButton = $("#downloadPdf");

    if (downloadPdfButton) {

        downloadPdfButton.addEventListener("click", function () {

            window.print();
        });
    }


    // =================================================
    // 10. LIBRARY OPAC PAGE
    // =================================================

    const bookSearch = $("#bookSearch");
    const catalogue = $("#catalogue");

    if (bookSearch || catalogue) {

        const subjectFilter = $("select[aria-label='Filter by subject']");

        function filterBooks() {

            const searchText = bookSearch
                ? bookSearch.value.toLowerCase().trim()
                : "";

            const selectedSubject = subjectFilter
                ? subjectFilter.value.toLowerCase()
                : "all";

            const rows = catalogue
                ? $$("tbody tr", catalogue)
                : [];

            rows.forEach(row => {

                const text = row.textContent.toLowerCase();

                const matchesSearch = text.includes(searchText);

                const matchesSubject =
                    selectedSubject === "all" ||
                    text.includes(selectedSubject);

                row.style.display =
                    matchesSearch && matchesSubject ? "" : "none";
            });

            // Also filter catalogue cards if present.
            $$(".book-card, .opac-book-card").forEach(card => {

                const text = card.textContent.toLowerCase();

                card.style.display =
                    text.includes(searchText) ? "" : "none";
            });
        }

        if (bookSearch) {
            bookSearch.addEventListener("input", filterBooks);
        }

        if (subjectFilter) {
            subjectFilter.addEventListener("change", filterBooks);
        }

        // Category filter buttons
        $$(".opac-search-section button, .opac-category-card button")
            .forEach(button => {

                button.addEventListener("click", function () {

                    const category = button.textContent.trim();

                    if (bookSearch) {
                        bookSearch.value = category;
                        filterBooks();
                    }

                    showToast("Library filter updated");
                });
            });
    }


    // =================================================
    // 11. ASSIGNMENTS PAGE
    // =================================================

    const assignmentTabs = $$(".assignment-tab");
    const assignmentCards = $$(".assignment-task-card");

    if (assignmentTabs.length && assignmentCards.length) {

        assignmentTabs.forEach(tab => {

            tab.addEventListener("click", function () {

                assignmentTabs.forEach(item =>
                    item.classList.remove("active")
                );

                tab.classList.add("active");

                const filter = tab.textContent.trim()
                    .split(/\s+/)[0]
                    .toLowerCase();

                assignmentCards.forEach(card => {

                    const status = $(".task-status", card);

                    const statusText = status
                        ? status.textContent.trim().toLowerCase()
                        : "";

                    let visible = true;

                    if (filter === "pending") {
                        visible = statusText.includes("pending");
                    } else if (filter === "submitted") {
                        visible = statusText.includes("submitted");
                    } else if (filter === "overdue") {
                        visible = statusText.includes("overdue");
                    }

                    card.style.display = visible ? "" : "none";
                });
            });
        });
    }

    // Assignment submission: local file selection only.
    $$(".task-submit-button").forEach(button => {

        button.addEventListener("click", function () {

            const card = button.closest(".assignment-task-card");

            if (!card) return;

            const status = $(".task-status", card);

            if (status && status.textContent.toLowerCase().includes("submitted")) {
                showToast("This assignment is already marked as submitted.");
                return;
            }

            if (status && status.textContent.toLowerCase().includes("overdue")) {
                showToast("This assignment is marked overdue.");
                return;
            }

            const fileInput = document.createElement("input");

            fileInput.type = "file";
            fileInput.accept = ".pdf,.doc,.docx,.zip,.sql,.xlsx";

            fileInput.addEventListener("change", function () {

                if (!fileInput.files.length) return;

                const file = fileInput.files[0];

                showToast(
                    "Selected " + file.name +
                    ". Connect the backend to submit this file."
                );
            });

            fileInput.click();
        });
    });

    const uploadGuideButton = $(".upload-help-button");

    if (uploadGuideButton) {

        uploadGuideButton.addEventListener("click", function () {

            showToast(
                "Choose an assignment and select its permitted file. " +
                "Actual submission requires backend integration."
            );
        });
    }


    // =================================================
    // 12. PAYMENT PAGE
    // =================================================

    const paymentTable = $(".payment-table");

    if (paymentTable) {

        const historyButton = $(".history-filter-button");
        const paymentRows = $$("tbody tr", paymentTable);

        if (historyButton) {

            let filter = "all";

            historyButton.addEventListener("click", function () {

                filter =
                    filter === "all" ? "paid" :
                    filter === "paid" ? "pending" : "all";

                historyButton.textContent =
                    filter === "all" ? "All transactions" :
                    filter === "paid" ? "Paid transactions" :
                    "Pending transactions";

                paymentRows.forEach(row => {

                    const status = $(".payment-status", row);

                    const statusText = status
                        ? status.textContent.trim().toLowerCase()
                        : "";

                    row.style.display =
                        filter === "all" ||
                        statusText === filter ? "" : "none";
                });
            });
        }

        // Demo receipt generation for paid transactions.
        $$(".receipt-button", paymentTable).forEach(button => {

            button.addEventListener("click", function () {

                const row = button.closest("tr");

                if (!row) return;

                const status = $(".payment-status", row);

                if (!status || status.textContent.trim().toLowerCase() !== "paid") {
                    showToast("Receipt is not available for this transaction.");
                    return;
                }

                const cells = $$("td", row);

                const transaction = $(".transaction-info", cells[0]);

                const receiptData = [
                    ["CampusIQ - Fee Receipt"],
                    ["Transaction", transaction ? transaction.innerText.trim() : ""],
                    ["Date", cells[1].textContent.trim()],
                    ["Payment Method", cells[2].textContent.trim()],
                    ["Amount", cells[3].textContent.trim()],
                    ["Status", status.textContent.trim()]
                ];

                downloadCSV(
                    receiptData,
                    "CampusIQ_Fee_Receipt.csv"
                );

                showToast("Demo receipt downloaded.");
            });
        });

        const payButton = $(".payment-action-button");

        if (payButton) {

            payButton.addEventListener("click", function () {

                showToast(
                    "Online payment is a demo feature. No payment was processed."
                );
            });
        }
    }


    // =================================================
    // 13. GRIEVANCE PAGE
    // =================================================

    const grievanceForm = $("#grievanceForm");

    if (grievanceForm) {

        grievanceForm.addEventListener("submit", function (event) {

            event.preventDefault();

            if (!grievanceForm.reportValidity()) return;

            const grievance = {
                name: $("#grievanceName")?.value.trim(),
                studentId: $("#grievanceId")?.value.trim(),
                email: $("#grievanceEmail")?.value.trim(),
                category: $("#grievanceCategory")?.value,
                subject: $("#grievanceSubject")?.value.trim(),
                priority: $("#grievancePriority")?.value,
                description: $("#grievanceDescription")?.value.trim(),
                submittedAt: new Date().toISOString()
            };

            try {

                const existing = JSON.parse(
                    localStorage.getItem("campusiq-grievances") || "[]"
                );

                existing.push(grievance);

                localStorage.setItem(
                    "campusiq-grievances",
                    JSON.stringify(existing)
                );

                grievanceForm.reset();

                showToast(
                    "Demo grievance saved in this browser. Backend submission is not connected."
                );

            } catch (error) {

                showToast("Unable to save the demo grievance in this browser.");
            }
        });
    }


    // =================================================
    // 14. EVENTS PAGE
    // =================================================

    const eventsSection = $("#upcoming-events");

    if (eventsSection) {

        $$(".event-view-link", eventsSection).forEach(link => {

            link.addEventListener("click", function () {

                showToast("You are viewing the campus event details.");
            });
        });
    }


    // =================================================
    // 15. QUIZ PAGE
    // =================================================

    const quizList = $("#quiz-list");

    if (quizList) {

        const quizLinks = $$("a", quizList);

        quizLinks.forEach(link => {

            link.addEventListener("click", function () {

                // Allow normal navigation to the linked page.
                showToast("Opening quiz information...");
            });
        });
    }


    // =================================================
    // 16. QUIZ RESULTS PAGE
    // =================================================

    // Current quiz-results page contains static performance
    // information. No attempt data or quiz database is connected.


    // =================================================
    // 17. PROFILE PAGE
    // =================================================

    // Current profile page is a static profile display.
    // Profile editing requires editable form fields and backend support.


    // =================================================
    // 18. COMMON CSV DOWNLOAD FUNCTION
    // =================================================

    function downloadCSV(rows, filename) {

        const csv = rows.map(row =>

            row.map(value => {

                const safeValue = String(value ?? "")
                    .replace(/"/g, '""');

                return `"${safeValue}"`;

            }).join(",")

        ).join("\n");

        const blob = new Blob(
            ["\uFEFF" + csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }


    // =================================================
    // 19. INITIALIZATION MESSAGE
    // =================================================

    console.log(
        "CampusIQ Student Portal: Common JavaScript loaded successfully."
    );

});



/* =========================================================
   CAMPUSIQ INTERACTIVE FEATURES
   Results, assignment file selection/submission and quizzes.
   These are browser-side demonstration features. They are
   not connected to a college server or database.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    const page = decodeURIComponent(location.pathname.split("/").pop()).toLowerCase();
    const $one = (selector, root = document) => root.querySelector(selector);
    const $all = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function notify(message) {
        if (typeof window.showToast === "function") window.showToast(message);
        else alert(message);
    }

    // 1. RESULTS: semester selection updates the displayed marks and summary.
    if (page === "results.html") {
        const semesters = {
            "1": { gpa: "8.20", credits: 18, subjects: [
                ["Programming Fundamentals","DS101",88,4],["Mathematics I","MA101",82,4],
                ["Computer Fundamentals","CS101",85,3],["Communication Skills","HS101",90,3],
                ["Environmental Studies","EVS101",86,4]
            ]},
            "2": { gpa: "8.45", credits: 18, subjects: [
                ["Object Oriented Programming","DS201",92,4],["Database Management","DS202",86,4],
                ["Statistics I","ST201",84,3],["Data Structures","CS202",88,4],
                ["Professional English","HS202",83,3]
            ]},
            "3": { gpa: "8.90", credits: 18, subjects: [
                ["Object Oriented Programming","DS301",92,4],["Data Structures","DS302",89,4],
                ["Probability and Statistics","ST301",87,3],["Operating Systems","CS301",85,4],
                ["Web Technology","WT301",90,3]
            ]},
            "4": { gpa: "8.90", credits: 18, subjects: [
                ["Java Programming","DS401",94,4],["Database Systems","DS402",91,4],
                ["Machine Learning","DS403",88,4],["Data Visualization","DS404",86,3],
                ["Research Methodology","RM401",89,3]
            ]}
        };
        const picker = $one("#semesterPicker");
        const body = $one("#marksheetBody");
        if (picker && body) {
            function grade(mark) {
                if (mark >= 90) return ["A+", 9];
                if (mark >= 80) return ["A", 8];
                if (mark >= 70) return ["B+", 7];
                if (mark >= 60) return ["B", 6];
                if (mark >= 50) return ["C", 5];
                return ["F", 0];
            }
            function renderSemester(key) {
                const selected = key === "all" ? "3" : key;
                const data = semesters[selected];
                if (!data) return;
                body.innerHTML = data.subjects.map(subject => {
                    const [name, code, mark, credits] = subject;
                    const [letter, points] = grade(mark);
                    return `<tr><td>${name}</td><td>${code}</td><td>${mark}</td><td>${credits}</td><td>${letter}</td><td>${points}</td><td>${mark >= 40 ? "PASS" : "FAIL"}</td></tr>`;
                }).join("");
                const title = $one("#marksheetTitle");
                const subtitle = $one("#marksheetSubtitle");
                if (title) title.textContent = key === "all" ? "Complete Academic Record" : `Semester ${key} Marksheet`;
                if (subtitle) subtitle.textContent = key === "all" ? "Latest available semester preview" : `Academic performance for Semester ${key}`;
                if ($one("#marksheetSgpa")) $one("#marksheetSgpa").textContent = data.gpa;
                if ($one("#marksheetCredits")) $one("#marksheetCredits").textContent = data.credits;
                if ($one("#marksheetStatus")) $one("#marksheetStatus").textContent = "PASSED";
                $all(".semester-chip", picker).forEach(button => button.classList.toggle("active", button.dataset.semester === key));
                if ($one("#sgpaValue")) $one("#sgpaValue").textContent = data.gpa;
                if ($one("#sgpaCaption")) $one("#sgpaCaption").textContent = key === "all" ? "Latest semester" : `Semester ${key}`;
                if ($one("#summaryCaption")) $one("#summaryCaption").textContent = key === "all" ? "All semesters overview" : `Semester ${key} overview`;
            }
            picker.addEventListener("click", event => {
                const button = event.target.closest("[data-semester]");
                if (button) renderSemester(button.dataset.semester);
            });
            renderSemester("all");
            const csv = $one("#downloadCsv");
            if (csv) csv.addEventListener("click", () => {
                const rows = [["Subject","Code","Marks","Credits","Grade","Points","Result"]];
                $all("tr", body).forEach(row => rows.push($all("td", row).map(cell => cell.textContent.trim())));
                const csvText = rows.map(row => row.map(value => `"${String(value).replace(/"/g,'""')}"`).join(",")).join("\r\n");
                const blob = new Blob([csvText], {type:"text/csv;charset=utf-8"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "CampusIQ-Semester-Marks.csv"; a.click();
                URL.revokeObjectURL(url);
            });
        }
    }

    // 2. ASSIGNMENTS: select a file, attach it to a task and mark submitted.
    if (page === "assignments.html") {
        const input = $one("#assignmentFileInput");
        const fileLabel = $one("#assignmentSelectedFile");
        const message = $one("#assignmentUploadMessage");
        let chosenFile = null;
        let activeTask = null;
        if (input) {
            input.addEventListener("change", () => {
                chosenFile = input.files && input.files[0] ? input.files[0] : null;
                if (fileLabel) fileLabel.textContent = chosenFile ? `Selected: ${chosenFile.name} (${(chosenFile.size/1024/1024).toFixed(2)} MB)` : "No file selected yet.";
                if (message) message.textContent = "";
            });
        }
        $all(".task-submit-button").forEach(button => {
            button.addEventListener("click", () => {
                activeTask = button.closest(".assignment-task-card");
                if (input) input.click();
                if (message) message.textContent = "Choose the file for this assignment, then click Submit Work again.";
            });
        });
        const uploadCard = $one(".upload-card");
        if (uploadCard) {
            const submit = document.createElement("button");
            submit.type = "button"; submit.className = "task-submit-button assignment-final-submit";
            submit.textContent = "Submit Selected File";
            uploadCard.appendChild(submit);
            submit.addEventListener("click", () => {
                if (!chosenFile) { notify("Please choose a file first."); if (input) input.click(); return; }
                if (!activeTask) { notify("Please click Submit Work on an assignment first."); return; }
                const allowed = /\.(pdf|doc|docx|zip|ppt|pptx|xls|xlsx)$/i.test(chosenFile.name);
                if (!allowed) { notify("Choose a permitted document or ZIP file."); return; }
                const title = $one("h3", activeTask)?.textContent.trim() || "Assignment";
                const status = $one(".task-status", activeTask);
                if (status) { status.textContent = "Submitted"; status.classList.remove("status-pending","status-overdue"); status.classList.add("status-submitted"); }
                const action = $one(".task-action", activeTask);
                if (action) {
                    let note = $one(".assignment-file-note", action);
                    if (!note) { note = document.createElement("small"); note.className = "assignment-file-note"; action.appendChild(note); }
                    note.textContent = chosenFile.name;
                }
                try {
                    const records = JSON.parse(localStorage.getItem("campusiq-assignment-submissions") || "[]");
                    records.push({title, fileName:chosenFile.name, submittedAt:new Date().toISOString()});
                    localStorage.setItem("campusiq-assignment-submissions", JSON.stringify(records));
                } catch (error) {}
                if (message) message.textContent = `“${chosenFile.name}” selected for ${title}. Demo submission marked complete in this browser.`;
                notify("Assignment marked as submitted in this browser.");
                chosenFile = null; input.value = ""; if (fileLabel) fileLabel.textContent = "No file selected yet.";
            });
        }
        const visual = $one(".upload-picker");
        if (visual) visual.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input?.click(); }
        });
    }

    // 3. QUIZ QUESTION BANK: four sample quizzes with answer review.
    const quizBank = {
      "1": {title:"Object Oriented Programming", questions:[
        ["Which concept bundles data and methods together?",["Inheritance","Encapsulation","Polymorphism","Abstraction"],1],
        ["Which keyword creates an object in Java?",["class","this","new","void"],2],
        ["A class is best described as a…",["Blueprint for objects","Running process","Database table","Loop"],0],
        ["Which feature allows one interface with many implementations?",["Compilation","Polymorphism","Iteration","Casting"],1],
        ["Which keyword refers to the current object?",["super","static","this","final"],2]
      ]},
      "2": {title:"Introduction to Statistics", questions:[
        ["What is the mean of 2, 4 and 6?",["3","4","5","6"],1],
        ["Which measure is the middle value in ordered data?",["Mean","Mode","Median","Range"],2],
        ["What is the probability of a certain event?",["0","0.5","1","100"],2],
        ["Which measure is most affected by extreme values?",["Mean","Median","Mode","Quartile"],0],
        ["The mode is the value that…",["Is smallest","Occurs most often","Is central","Is total"],1]
      ]},
      "3": {title:"SQL Knowledge Check", questions:[
        ["Which SQL command retrieves rows?",["GET","SELECT","OPEN","FETCH ALL"],1],
        ["Which clause filters rows?",["ORDER BY","GROUP BY","WHERE","JOIN"],2],
        ["Which key uniquely identifies a row?",["Foreign key","Primary key","Index only","Composite value"],1],
        ["Which command removes a table definition?",["DELETE","REMOVE","DROP","CLEAR"],2],
        ["Which join returns matching rows from both tables?",["INNER JOIN","LEFT JOIN","CROSS JOIN","FULL OUTER JOIN"],0]
      ]},
      "4": {title:"HTML & CSS Essentials", questions:[
        ["Which tag creates a hyperlink?",["<link>","<a>","<href>","<url>"],1],
        ["Which property changes text color?",["font-style","background","color","text-size"],2],
        ["Which selector targets an element ID?",[".","#","*","@"],1],
        ["Which HTML element is used for the main page content?",["<main>","<head>","<meta>","<title>"],0],
        ["Which CSS layout is one-dimensional?",["Grid","Flexbox","Table","Float"],1]
      ]}
    };
    const params = new URLSearchParams(location.search);
    const quizId = params.get("quiz") || "1";
    const storedKey = "campusiq-quiz-attempts";
    function getAttempts() { try { return JSON.parse(localStorage.getItem(storedKey) || "{}"); } catch(e) { return {}; } }

    if (page === "quiz-attempt.html") {
        const quizData = quizBank[quizId];
        const container = $one("#quizQuestionContainer");
        const form = $one("#quizAttemptForm");
        if (quizData && container && form) {
            $one("#attemptQuizTitle").textContent = quizData.title;
            

container.innerHTML = quizData.questions.map((q, i) => `
    <section class="quiz-question-card">

        <h3 class="quiz-question-title">
            ${i + 1}. ${q[0]}
        </h3>

        <div class="quiz-options-list">
            ${q[1].map((option, j) => `
                <label class="quiz-answer-option">
                    <input
                        type="radio"
                        name="question${i}"
                        value="${j}"
                        required
                    >
                    <span>${option.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
                </label>
            `).join("")}
        </div>

    </section>
`).join("");

            form.addEventListener("submit", event => {
                event.preventDefault();
                const answers = quizData.questions.map((q,i) => {
                    const selected = $one(`input[name="question${i}"]:checked`, form);
                    return selected ? Number(selected.value) : -1;
                });
                if (answers.some(answer => answer < 0)) { $one("#quizAttemptMessage").textContent = "Please answer every question before submitting."; return; }
                const score = answers.reduce((sum,answer,i)=>sum+(answer===quizData.questions[i][2]?1:0),0);
                const attempts = getAttempts();
                attempts[quizId] = {title:quizData.title, answers, score, total:quizData.questions.length, date:new Date().toLocaleDateString("en-IN")};
                localStorage.setItem(storedKey, JSON.stringify(attempts));
                location.href = `quiz-review.html?quiz=${quizId}`;
            });
        }
    }

    if (page === "quiz-review.html") {
        const quizData = quizBank[quizId];
        const attempt = getAttempts()[quizId];
        const review = $one("#quizAnswerReview");
        if (quizData && review) {
            $one("#reviewQuizTitle").textContent = quizData.title;
            if (!attempt) {
                $one("#reviewQuizScore").textContent = "You have not attempted this quiz yet.";
                review.innerHTML = '<p>Go to the Quiz Hub and choose Take Quiz to begin.</p>';
            } else {
                $one("#reviewQuizScore").textContent = `Score: ${attempt.score}/${attempt.total} · Attempted: ${attempt.date}`;
                review.innerHTML = quizData.questions.map((q,i) => {
                    const correct = q[2], selected = attempt.answers[i];
                    const isCorrect = selected === correct;
                    return `<article class="quiz-review-card ${isCorrect?"answer-correct":"answer-incorrect"}">
                      <h3>${i+1}. ${q[0]}</h3>
                      <p><strong>Your answer:</strong> ${selected < 0 ? "Not answered" : q[1][selected]}</p>
                      <p><strong>Correct answer:</strong> ${q[1][correct]}</p>
                      <span>${isCorrect ? "Correct" : "Incorrect"}</span>
                    </article>`;
                }).join("");
            }
        }
    }

    // Show review links only after an attempt exists in this browser.
    if (page === "quiz.html") {
        const attempts = getAttempts();
        $all("[data-review-quiz]").forEach(link => {
            const id = link.dataset.reviewQuiz;
            const attempted = Boolean(attempts[id]);
            link.hidden = !attempted;
            const take = link.parentElement?.querySelector(".quiz-take-link");
            if (take && attempted) take.textContent = "Retake Quiz ↗";
        });
    }
});
const uploadArea = document.getElementById("uploadArea");
const assignmentFile = document.getElementById("assignmentFile");
const selectedFileName = document.getElementById("selectedFileName");

if (uploadArea && assignmentFile) {
    uploadArea.addEventListener("click", () => {
        assignmentFile.click();
    });

    assignmentFile.addEventListener("change", () => {
        if (assignmentFile.files.length > 0) {
            selectedFileName.textContent =
                "Selected: " + assignmentFile.files[0].name;
        }
    });
}