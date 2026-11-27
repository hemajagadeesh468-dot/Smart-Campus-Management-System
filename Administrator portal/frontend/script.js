
/* ==========================================
   CAMPUSIQ ADMINISTRATOR BACKEND LOGIN
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("adminBackendLoginForm");

    if (!form) return;

    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");
    const toggleButton = document.getElementById("adminPasswordToggle");
    const message = document.getElementById("adminLoginMessage");
    const submitButton = form.querySelector(".admin-auth-submit");

    // SHOW / HIDE PASSWORD

    toggleButton.addEventListener("click", function () {

        const hidden = passwordInput.type === "password";

        passwordInput.type = hidden ? "text" : "password";
        toggleButton.textContent = hidden ? "Hide" : "Show";

    });

    // ADMINISTRATOR LOGIN

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        message.style.color = "#e59b91";
        message.textContent = "";

        if (!email || !password) {
            message.textContent = "Please enter your email and password.";
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = "Signing in...";

        message.textContent = "Connecting to CampusIQ server...";

        try {

            const response = await fetch("/api/login", {
                method: "POST",

                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },

                credentials: "include",

                body: new URLSearchParams({
                    email: email,
                    password: password
                })
            });

            const result = await response.text();

            if (response.ok) {

                sessionStorage.setItem("adminLoggedIn", "true");

                message.style.color = "#82c99a";
                message.textContent = "Login successful! Opening dashboard...";

                window.location.href = "dashboard.html";

            } else {

                message.textContent =
                    result || "Invalid administrator email or password.";

                submitButton.disabled = false;
                submitButton.innerHTML =
                    'Sign in to CampusIQ <span>→</span>';

            }

        } catch (error) {

            message.textContent =
                "Unable to connect to CampusIQ server. Please try again.";

            submitButton.disabled = false;
            submitButton.innerHTML =
                'Sign in to CampusIQ <span>→</span>';

        }

    });

});

 // =================================
 // CAMPUSIQ ADMINISTRATOR PROFILE
 // JAVA BACKEND CONNECTION
 // =================================

(function () {

    const displayName = document.getElementById("displayName");

    if (!displayName) return;

    const profileForm = document.getElementById("profileForm");
    const editProfileBtn = document.getElementById("editProfileBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    let adminData = {};

    // LOAD PROFILE FROM DATABASE
    async function loadProfile() {

        try {

            const response = await fetch("/api/profile", {
                method: "GET",
                credentials: "same-origin"
            });

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to load profile");
            }

            adminData = await response.json();

            displayName.textContent = adminData.name;

            document.getElementById("nameDisplay").textContent =
                adminData.name;

            document.getElementById("emailDisplay").textContent =
                adminData.email;

            document.getElementById("phoneDisplay").textContent =
                adminData.phone || "Not provided";

            // Update profile initials
            const initial = adminData.name.charAt(0).toUpperCase();

            document.getElementById("profileAvatar").textContent = initial;
            document.getElementById("sidebarAvatar").textContent = initial;
            document.getElementById("sidebarName").textContent =
                adminData.name;

            // Fill edit form
            document.getElementById("editName").value = adminData.name;
            document.getElementById("editEmail").value = adminData.email;
            document.getElementById("editPhone").value =
                adminData.phone || "";

        } catch (error) {
            console.error("Profile loading failed:", error);
        }
    }

    // OPEN EDIT FORM
    if (editProfileBtn && profileForm) {

        editProfileBtn.addEventListener("click", function () {

            profileForm.style.display =
                profileForm.style.display === "block"
                    ? "none"
                    : "block";

        });
    }

    // CANCEL EDIT
    if (cancelEditBtn && profileForm) {

        cancelEditBtn.addEventListener("click", function () {

            profileForm.style.display = "none";
            loadProfile();

        });
    }

    // SAVE PROFILE TO SQLITE
    if (profileForm) {

        profileForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("editName").value.trim();

            const email =
                document.getElementById("editEmail").value.trim();

            const phone =
                document.getElementById("editPhone").value.trim();

            if (!name || !email) {
                alert("Please enter your name and email.");
                return;
            }

            try {

                const response = await fetch("/api/profile", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    credentials: "same-origin",
                    body: new URLSearchParams({
                        name: name,
                        email: email,
                        phone: phone,
                        designation: adminData.designation,
                        department: adminData.department
                    })
                });

                if (response.status === 401) {
                    window.location.href = "login.html";
                    return;
                }

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                alert("Profile updated successfully!");

                profileForm.style.display = "none";

                await loadProfile();

            } catch (error) {

                alert("Profile update failed: " + error.message);

            }

        });
    }

    // LOGOUT
    if (logoutBtn) {

        logoutBtn.addEventListener("click", async function () {

            if (!confirm("Are you sure you want to logout?")) return;

            try {

                const response = await fetch("/api/logout", {
                    method: "POST",
                    credentials: "same-origin"
                });

                if (!response.ok) {
                    throw new Error("Logout failed");
                }

                window.location.href = "login.html";

            } catch (error) {

                alert("Unable to logout. Please try again.");

            }

        });
    }

    loadProfile();

})();


    // CURRENT DATE

    const currentDateElement = document.getElementById("currentDate");

    if (currentDateElement) {
        const today = new Date();

        currentDateElement.textContent = today.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }


    // CALENDAR

    const calendarMonth = document.getElementById("calendarMonth");
    const calendarDays = document.getElementById("calendarDays");

    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");

    let calendarDate = new Date();
    let selectedDate = new Date();

    function renderCalendar() {

        if (!calendarMonth || !calendarDays) return;

        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        calendarMonth.textContent = calendarDate.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric"
        });

        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        calendarDays.innerHTML = "";

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement("span");
            emptyDay.className = "empty";
            calendarDays.appendChild(emptyDay);
        }

        for (let day = 1; day <= totalDays; day++) {

            const dayElement = document.createElement("span");
            dayElement.textContent = day;

            const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

            const isSelected =
                day === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear();

            if (isToday) {
                dayElement.classList.add("today");
            }

            if (isSelected) {
                dayElement.classList.add("selected");
            }

            dayElement.addEventListener("click", function () {

                selectedDate = new Date(year, month, day);

                renderCalendar();

            });

            calendarDays.appendChild(dayElement);
        }

    }

    if (prevMonth) {
        prevMonth.addEventListener("click", function () {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonth) {
        nextMonth.addEventListener("click", function () {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    renderCalendar();
    // DARK AND LIGHT THEME SWITCH

    const themeToggle = document.getElementById("themeToggle");

    // Load previously selected theme
    const savedTheme = localStorage.getItem("campusIQTheme");

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    }

    function updateThemeButton() {
        if (!themeToggle) return;

        if (document.body.classList.contains("light-theme")) {
            themeToggle.textContent = "☾ Dark Mode";
        } else {
            themeToggle.textContent = "☀ Light Mode";
        }
    }

    updateThemeButton();

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {

            document.body.classList.toggle("light-theme");

            const currentTheme =
                document.body.classList.contains("light-theme")
                    ? "light"
                    : "dark";

            localStorage.setItem("campusIQTheme", currentTheme);

            updateThemeButton();

        });
    }

    /* =====================================
    CAMPUSIQ - DASHBOARD UPCOMING ACTIVITIES
    ===================================== */

    const upcomingActivityList = document.getElementById("upcomingActivityList");

    if (upcomingActivityList) {

        function displayUpcomingActivities() {

            upcomingActivityList.innerHTML = "";

            let savedActivities = [];

            try {
                savedActivities = JSON.parse(
                    localStorage.getItem("campusIQActivities") || "[]"
                );

                if (!Array.isArray(savedActivities)) {
                    savedActivities = [];
                }
            } catch (error) {
                savedActivities = [];
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcomingActivities = savedActivities
                .filter(activity => {
                    if (!activity.date) return false;

                    const [year, month, day] = activity.date.split("-").map(Number);
                    const activityDate = new Date(year, month - 1, day);

                    return !isNaN(activityDate.getTime()) &&
                        activityDate >= today;
                })
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 3);

            if (upcomingActivities.length === 0) {
                upcomingActivityList.textContent = "No upcoming activities";
                return;
            }

            upcomingActivities.forEach(activity => {

                const [year, month, day] = activity.date.split("-");

                const eventItem = document.createElement("div");
                eventItem.className = "event-item";

                const eventDate = document.createElement("div");
                eventDate.className = "event-date";
                eventDate.textContent = day;

                const eventDetails = document.createElement("div");
                eventDetails.className = "event-details";

                const eventName = document.createElement("h4");
                eventName.textContent = activity.name;

                const eventType = document.createElement("p");
                eventType.textContent = activity.type + " • " + activity.venue;

                eventDetails.append(eventName, eventType);

                const eventMonth = document.createElement("span");
                eventMonth.className = "event-time";

                eventMonth.textContent = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day)
                ).toLocaleString("en-IN", {
                    month: "short"
                });

                eventItem.append(eventDate, eventDetails, eventMonth);
                upcomingActivityList.appendChild(eventItem);
            });
        }

        displayUpcomingActivities();
    }


    /* =====================================
    CAMPUSIQ - STUDENT MANAGEMENT
    ===================================== */

    (function () {

        const studentTable = document.getElementById("studentTableBody");

        // Run only on Students page
        if (!studentTable) return;

        const searchInput = document.getElementById("studentSearch");
        const departmentFilter = document.getElementById("studentDepartmentFilter");
        const yearFilter = document.getElementById("studentYearFilter");
        const addButton = document.getElementById("addStudentBtn");
        const printButton = document.getElementById("printStudents");

        const totalElement = document.getElementById("totalStudents");
        const departmentElement = document.getElementById("totalStudentDepartments");
        const activeElement = document.getElementById("activeStudents");
        const attendanceElement = document.getElementById("averageAttendance");
        const recordCount = document.getElementById("studentRecordCount");
        const departmentSummary = document.getElementById("studentDepartmentSummary");


        // GET ATTENDANCE
        function getAttendance(row) {
            const value = row.cells[5]?.textContent.trim() || "0";
            return Number(value.replace("%", "")) || 0;
        }


        // UPDATE DEPARTMENT FILTER
        function updateDepartmentFilter() {

            const selectedValue = departmentFilter.value;
            const departments = new Set();

            studentTable.querySelectorAll("tr").forEach(row => {

                const department = row.cells[2]?.textContent.trim();

                if (department) {
                    departments.add(department);
                }
            });

            departmentFilter.innerHTML = "";

            const allOption = document.createElement("option");
            allOption.value = "";
            allOption.textContent = "All Departments";
            departmentFilter.appendChild(allOption);

            departments.forEach(department => {

                const option = document.createElement("option");
                option.value = department;
                option.textContent = department;

                departmentFilter.appendChild(option);
            });

            if (departments.has(selectedValue)) {
                departmentFilter.value = selectedValue;
            }
        }


        // UPDATE YEAR FILTER
        function updateYearFilter() {

            const selectedValue = yearFilter.value;
            const years = new Set();

            studentTable.querySelectorAll("tr").forEach(row => {

                const year = row.cells[3]?.textContent.trim();

                if (year) {
                    years.add(year);
                }
            });

            yearFilter.innerHTML = "";

            const allOption = document.createElement("option");
            allOption.value = "";
            allOption.textContent = "All Years";
            yearFilter.appendChild(allOption);

            years.forEach(year => {

                const option = document.createElement("option");
                option.value = year;
                option.textContent = year;

                yearFilter.appendChild(option);
            });

            if (years.has(selectedValue)) {
                yearFilter.value = selectedValue;
            }
        }


        // UPDATE STATISTICS
        function updateStudentStats() {

            const rows = Array.from(studentTable.querySelectorAll("tr"));

            const departments = new Set();

            let activeCount = 0;
            let attendanceTotal = 0;

            rows.forEach(row => {

                const department = row.cells[2]?.textContent.trim();
                const status = row.querySelector(".student-status");

                if (department) {
                    departments.add(department);
                }

                if (status && status.classList.contains("active-status")) {
                    activeCount++;
                }

                attendanceTotal += getAttendance(row);
            });

            const average = rows.length
                ? Math.round(attendanceTotal / rows.length)
                : 0;

            totalElement.textContent = rows.length;
            departmentElement.textContent = departments.size;
            activeElement.textContent = activeCount;
            attendanceElement.textContent = average + "%";

            recordCount.textContent = rows.length + " Records";

            updateDepartmentSummary(rows);
            updateDepartmentFilter();
            updateYearFilter();
        }


        // DEPARTMENT SUMMARY
        function updateDepartmentSummary(rows) {

            departmentSummary.innerHTML = "";

            const counts = {};

            rows.forEach(row => {

                const department = row.cells[2]?.textContent.trim();

                if (department) {
                    counts[department] = (counts[department] || 0) + 1;
                }
            });

            Object.entries(counts).forEach(([department, count]) => {

                const item = document.createElement("div");
                item.className = "student-department-row";

                const name = document.createElement("span");
                name.textContent = department;

                const total = document.createElement("strong");
                total.textContent = count + " Students";

                item.append(name, total);
                departmentSummary.appendChild(item);
            });

            if (Object.keys(counts).length === 0) {
                departmentSummary.textContent =
                    "No department records available.";
            }
        }


        // SEARCH AND FILTER
        function filterStudents() {

            const searchValue = searchInput.value.toLowerCase().trim();
            const selectedDepartment = departmentFilter.value;
            const selectedYear = yearFilter.value;

            studentTable.querySelectorAll("tr").forEach(row => {

                const rowText = row.textContent.toLowerCase();
                const department = row.cells[2]?.textContent.trim();
                const year = row.cells[3]?.textContent.trim();

                const matchesSearch = rowText.includes(searchValue);

                const matchesDepartment =
                    !selectedDepartment ||
                    department === selectedDepartment;

                const matchesYear =
                    !selectedYear ||
                    year === selectedYear;

                row.style.display =
                    matchesSearch && matchesDepartment && matchesYear
                        ? ""
                        : "none";
            });
        }

        searchInput.addEventListener("input", filterStudents);
        departmentFilter.addEventListener("change", filterStudents);
        yearFilter.addEventListener("change", filterStudents);


        // ADD STUDENT
        addButton.addEventListener("click", function () {

            const name = prompt("Enter student name:");

            if (!name || !name.trim()) return;


            // ACCEPT ANY DEPARTMENT
            const department = prompt("Enter any department name:");

            if (!department || !department.trim()) {
                alert("Please enter a department name.");
                return;
            }


            // ACCEPT ANY YEAR
            const year = prompt(
                "Enter student year or academic level:"
            );

            if (!year || !year.trim()) {
                alert("Please enter the student's year.");
                return;
            }


            // EMAIL VALIDATION
            const email = prompt("Enter student email:");

            if (
                !email ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
            ) {
                alert("Please enter a valid email address.");
                return;
            }


            // ATTENDANCE VALIDATION
            const attendance = prompt(
                "Enter attendance percentage (0-100):"
            );

            if (attendance === null || attendance.trim() === "") {
                return;
            }

            const attendanceNumber = Number(attendance);

            if (
                !Number.isFinite(attendanceNumber) ||
                attendanceNumber < 0 ||
                attendanceNumber > 100
            ) {
                alert("Attendance must be between 0 and 100.");
                return;
            }


            // GENERATE UNIQUE STUDENT ID
            const existingIds = Array.from(
                studentTable.querySelectorAll("tr")
            ).map(row => row.cells[0]?.textContent.trim());

            let studentNumber = 1;
            let studentId;

            do {
                studentId = "STU" + String(studentNumber).padStart(3, "0");
                studentNumber++;
            } while (existingIds.includes(studentId));


            // CREATE TABLE ROW
            const row = document.createElement("tr");

            const values = [
                studentId,
                name.trim(),
                department.trim(),
                year.trim(),
                email.trim(),
                attendanceNumber + "%"
            ];

            values.forEach(value => {

                const cell = document.createElement("td");
                cell.textContent = value;

                row.appendChild(cell);
            });


            // STATUS
            const statusCell = document.createElement("td");

            const statusBadge = document.createElement("span");

            statusBadge.className = "student-status active-status";
            statusBadge.textContent = "Active";

            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);


            // DELETE BUTTON
            const actionCell = document.createElement("td");

            const deleteButton = document.createElement("button");

            deleteButton.className = "student-delete-btn";
            deleteButton.textContent = "Delete";

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);


            // ADD STUDENT TO TABLE
            studentTable.appendChild(row);


            // UPDATE PAGE
            updateStudentStats();
            filterStudents();

            alert("Student added successfully!");
        });


        // DELETE STUDENT
        studentTable.addEventListener("click", function (event) {

            if (event.target.classList.contains("student-delete-btn")) {

                const confirmed = confirm(
                    "Are you sure you want to delete this student?"
                );

                if (confirmed) {

                    event.target.closest("tr").remove();

                    updateStudentStats();
                    filterStudents();
                }
            }
        });


        // PRINT REPORT
        printButton.addEventListener("click", function () {
            window.print();
        });


        // INITIAL PAGE LOAD
        updateStudentStats();

    })();


    /* =====================================
    CAMPUSIQ - FACULTY MANAGEMENT
    ===================================== */

    (function () {
        // PAGE ELEMENTS
        const facultyTable =
            document.getElementById("facultyTable");

        const facultyTableBody =
            document.getElementById("facultyTableBody") ||
            (facultyTable ? facultyTable.querySelector("tbody") : null) ||
            document.querySelector("#facultyTable tbody");

        const facultySearch =
            document.getElementById("facultySearch") ||
            document.querySelector(".faculty-search-area input");

        const addFacultyBtn =
            document.getElementById("addFacultyBtn");

        const searchArea =
            document.querySelector(".faculty-search-area");

        if (!facultyTableBody || !searchArea) return;

        const STORAGE_KEY = "campusIQFaculty";

        // ==========================================
        // DEPARTMENT MANUAL INPUT
        // ==========================================

        let departmentFilter =
            document.getElementById("facultyDepartmentFilter");

        if (!departmentFilter) {
            departmentFilter = document.createElement("input");
            departmentFilter.type = "text";
            departmentFilter.id = "facultyDepartmentFilter";
            departmentFilter.className = "faculty-dynamic-filter";
            departmentFilter.placeholder = "Type department to filter...";
            searchArea.appendChild(departmentFilter);
        } else {
            // Convert an existing department dropdown into a text input.
            if (departmentFilter.tagName !== "INPUT") {
                const newInput = document.createElement("input");
                newInput.type = "text";
                newInput.id = "facultyDepartmentFilter";
                newInput.className = "faculty-dynamic-filter";
                newInput.placeholder = "Type department to filter...";
                departmentFilter.replaceWith(newInput);
                departmentFilter = newInput;
            }
        }

        // ==========================================
        // DESIGNATION DROPDOWN
        // ==========================================

        let designationFilter =
            document.getElementById("facultyDesignationFilter");

        if (!designationFilter) {
            designationFilter = document.createElement("select");
            designationFilter.id = "facultyDesignationFilter";
            designationFilter.className = "faculty-dynamic-filter";
            searchArea.appendChild(designationFilter);
        }

        let facultyData = [];

        // ==========================================
        // READ EXISTING FACULTY RECORDS
        // ==========================================

        function readExistingFaculty() {
            return Array.from(
                facultyTableBody.querySelectorAll("tr")
            )
            .filter(row => row.cells.length >= 6)
            .map(row => ({
                id: row.cells[0].textContent.trim(),
                name: row.cells[1].textContent.trim(),
                department: row.cells[2].textContent.trim(),
                designation: row.cells[3].textContent.trim(),
                email: row.cells[4].textContent.trim(),
                status: row.cells[5].textContent.trim()
            }));
        }

        // ==========================================
        // SAVE AND LOAD FACULTY
        // ==========================================

        function saveFaculty() {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(facultyData)
            );
        }

        function loadFaculty() {
            const savedData = localStorage.getItem(STORAGE_KEY);

            if (savedData) {
                try {
                    facultyData = JSON.parse(savedData);
                } catch (error) {
                    facultyData = readExistingFaculty();
                    saveFaculty();
                }
            } else {
                facultyData = readExistingFaculty();
                saveFaculty();
            }

            renderFaculty();
        }

        // ==========================================
        // CREATE TABLE CELL
        // ==========================================

        function createCell(value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            return cell;
        }

        // ==========================================
        // DISPLAY FACULTY RECORDS
        // ==========================================

        function renderFaculty() {
            facultyTableBody.innerHTML = "";

            facultyData.forEach((faculty, index) => {
                const row = document.createElement("tr");

                row.appendChild(createCell(faculty.id));
                row.appendChild(createCell(faculty.name));
                row.appendChild(createCell(faculty.department));
                row.appendChild(createCell(faculty.designation));
                row.appendChild(createCell(faculty.email));

                const statusCell = document.createElement("td");
                const statusBadge = document.createElement("span");

                statusBadge.textContent = faculty.status;

                statusBadge.className =
                    faculty.status.toLowerCase() === "active"
                        ? "faculty-status active-status"
                        : "faculty-status inactive-status";

                statusCell.appendChild(statusBadge);
                row.appendChild(statusCell);

                const actionCell = document.createElement("td");
                const deleteButton = document.createElement("button");

                deleteButton.textContent = "Delete";
                deleteButton.className = "faculty-delete-btn";
                deleteButton.type = "button";

                deleteButton.addEventListener("click", function () {
                    if (
                        confirm(
                            "Are you sure you want to delete this faculty member?"
                        )
                    ) {
                        facultyData.splice(index, 1);
                        saveFaculty();
                        renderFaculty();
                    }
                });

                actionCell.appendChild(deleteButton);
                row.appendChild(actionCell);

                facultyTableBody.appendChild(row);
            });

            updateDesignationFilter();
            updateFacultyStats();
            applyFacultyFilters();
        }

        // ==========================================
        // UPDATE DESIGNATION OPTIONS
        // ==========================================

        function updateDesignationFilter() {
            const selectedDesignation = designationFilter.value;

            const designations = [
                ...new Set(
                    facultyData
                        .map(faculty => faculty.designation)
                        .filter(Boolean)
                )
            ].sort();

            designationFilter.innerHTML =
                '<option value="all">All Designations</option>';

            designations.forEach(designation => {
                const option = document.createElement("option");

                option.value = designation;
                option.textContent = designation;

                designationFilter.appendChild(option);
            });

            designationFilter.value =
                designations.includes(selectedDesignation)
                    ? selectedDesignation
                    : "all";
        }

        // ==========================================
        // SEARCH AND FILTER FACULTY
        // ==========================================

        function applyFacultyFilters() {
            const searchText = facultySearch
                ? facultySearch.value.toLowerCase().trim()
                : "";

            const typedDepartment =
                departmentFilter.value.toLowerCase().trim();

            const selectedDesignation =
                designationFilter.value;

            Array.from(
                facultyTableBody.querySelectorAll("tr")
            ).forEach(row => {
                const id = row.cells[0].textContent.toLowerCase();
                const name = row.cells[1].textContent.toLowerCase();
                const department = row.cells[2].textContent.toLowerCase();
                const designation = row.cells[3].textContent;
                const email = row.cells[4].textContent.toLowerCase();

                const matchesSearch =
                    id.includes(searchText) ||
                    name.includes(searchText) ||
                    department.includes(searchText) ||
                    designation.toLowerCase().includes(searchText) ||
                    email.includes(searchText);

                const matchesDepartment =
                    typedDepartment === "" ||
                    department.includes(typedDepartment);

                const matchesDesignation =
                    selectedDesignation === "all" ||
                    designation === selectedDesignation;

                row.style.display =
                    matchesSearch &&
                    matchesDepartment &&
                    matchesDesignation
                        ? ""
                        : "none";
            });
        }

        // ==========================================
        // UPDATE SUMMARY CARDS
        // ==========================================

        function updateFacultyStats() {
            const total = facultyData.length;

            const active = facultyData.filter(
                faculty =>
                    faculty.status.toLowerCase() === "active"
            ).length;

            const departments = new Set(
                facultyData
                    .map(faculty => faculty.department)
                    .filter(Boolean)
            ).size;

            const totalElement =
                document.getElementById("totalFaculty");

            const activeElement =
                document.getElementById("activeFaculty");

            const departmentElement =
                document.getElementById("totalDepartments");

            if (totalElement) totalElement.textContent = total;
            if (activeElement) activeElement.textContent = active;

            if (departmentElement) {
                departmentElement.textContent = departments;
            }
        }

        // ==========================================
        // GENERATE FACULTY ID
        // ==========================================

        function generateFacultyID() {
            let highestNumber = 0;

            facultyData.forEach(faculty => {
                const match = faculty.id.match(/FAC(\d+)/i);

                if (match) {
                    highestNumber = Math.max(
                        highestNumber,
                        Number(match[1])
                    );
                }
            });

            return "FAC" +
                String(highestNumber + 1).padStart(3, "0");
        }

        // ==========================================
        // ADD NEW FACULTY
        // ==========================================

        if (addFacultyBtn) {
            addFacultyBtn.addEventListener("click", function () {
                const name = prompt("Enter Faculty Name:");

                if (!name || !name.trim()) return;

                const department = prompt(
                    "Enter Department Name:\nExample: Data Science, AI & ML, Cyber Security"
                );

                if (!department || !department.trim()) return;

                const designation = prompt(
                    "Enter Designation:\nExample: Professor, Assistant Professor, HOD"
                );

                if (!designation || !designation.trim()) return;

                const email = prompt("Enter Faculty Email:");

                if (!email || !email.trim()) return;

                if (
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                ) {
                    alert("Please enter a valid email address.");
                    return;
                }

                const duplicateEmail = facultyData.some(
                    faculty =>
                        faculty.email.toLowerCase() ===
                        email.trim().toLowerCase()
                );

                if (duplicateEmail) {
                    alert("This email address is already registered.");
                    return;
                }

                const newFaculty = {
                    id: generateFacultyID(),
                    name: name.trim(),
                    department: department.trim(),
                    designation: designation.trim(),
                    email: email.trim(),
                    status: "Active"
                };

                facultyData.push(newFaculty);

                saveFaculty();
                renderFaculty();

                // Clear department filter to show the new record.
                departmentFilter.value = "";
                designationFilter.value = "all";

                if (facultySearch) {
                    facultySearch.value = "";
                }

                applyFacultyFilters();

                alert("Faculty member added successfully!");
            });
        }

        // ==========================================
        // EVENT LISTENERS
        // ==========================================

        if (facultySearch) {
            facultySearch.addEventListener(
                "input",
                applyFacultyFilters
            );
        }

        departmentFilter.addEventListener(
            "input",
            applyFacultyFilters
        );

        designationFilter.addEventListener(
            "change",
            applyFacultyFilters
        );

        // ==========================================
        // START FACULTY MANAGEMENT
        // ==========================================

        loadFaculty();

    })();

                    
    /* =====================================
    CAMPUSIQ - COURSES MANAGEMENT
    ===================================== */

    (function () {

        // PAGE ELEMENTS
        const courseTable = document.getElementById("courseTableBody");

        if (!courseTable) return;

        const courseSearch = document.getElementById("courseSearch");
        const addCourseBtn = document.getElementById("addCourseBtn");

        const totalCourses = document.getElementById("totalCourses");
        const activeCourses = document.getElementById("activeCourses");
        const totalDepartments = document.getElementById("totalDepartments");

        const searchArea = document.querySelector(".course-search-area");

        if (!searchArea) return;


        // =================================
        // DEPARTMENT MANUAL INPUT
        // =================================

        let departmentFilter = document.getElementById(
            "courseDepartmentFilter"
        );

        if (!departmentFilter) {
            departmentFilter = document.createElement("input");
            departmentFilter.type = "text";
            departmentFilter.id = "courseDepartmentFilter";
            departmentFilter.className = "course-dynamic-filter";
            departmentFilter.placeholder = "Type department to filter...";

            searchArea.appendChild(departmentFilter);

        } else if (departmentFilter.tagName !== "INPUT") {

            const newInput = document.createElement("input");

            newInput.type = "text";
            newInput.id = "courseDepartmentFilter";
            newInput.className = "course-dynamic-filter";
            newInput.placeholder = "Type department to filter...";

            departmentFilter.replaceWith(newInput);
            departmentFilter = newInput;
        }


        // =================================
        // UPDATE COURSE STATISTICS
        // =================================

        function updateCourseStats() {

            const rows = Array.from(
                courseTable.querySelectorAll("tr")
            );

            const activeCount = rows.filter(row =>
                row.querySelector(".active-status")
            ).length;

            const departments = new Set(
                rows.map(row =>
                    row.cells[2]?.textContent.trim()
                ).filter(Boolean)
            );

            if (totalCourses) {
                totalCourses.textContent = rows.length;
            }

            if (activeCourses) {
                activeCourses.textContent = activeCount;
            }

            if (totalDepartments) {
                totalDepartments.textContent = departments.size;
            }
        }


        // =================================
        // SEARCH AND DEPARTMENT FILTER
        // =================================

        function filterCourses() {

            const searchValue = courseSearch
                ? courseSearch.value.toLowerCase().trim()
                : "";

            const typedDepartment =
                departmentFilter.value.toLowerCase().trim();

            courseTable.querySelectorAll("tr").forEach(row => {

                const rowText = row.textContent.toLowerCase();

                const department =
                    row.cells[2]?.textContent.toLowerCase().trim() || "";

                const matchesSearch =
                    rowText.includes(searchValue);

                const matchesDepartment =
                    typedDepartment === "" ||
                    department.includes(typedDepartment);

                row.style.display =
                    matchesSearch && matchesDepartment ? "" : "none";
            });
        }


        // =================================
        // GENERATE UNIQUE COURSE ID
        // =================================

        function generateCourseID() {

            const existingIds = Array.from(
                courseTable.querySelectorAll("tr")
            ).map(row =>
                row.cells[0]?.textContent.trim()
            );

            let number = 1;
            let courseId;

            do {
                courseId =
                    "CRS" + String(number).padStart(3, "0");

                number++;

            } while (existingIds.includes(courseId));

            return courseId;
        }


        // =================================
        // ADD NEW COURSE
        // =================================

        if (addCourseBtn) {

            addCourseBtn.addEventListener("click", function () {

                const name = prompt("Enter course name:");

                if (!name || !name.trim()) return;


                // ACCEPT ANY DEPARTMENT
                const department = prompt(
                    "Enter Department Name:\nExample: Data Science, AI & ML, Cyber Security"
                );

                if (!department || !department.trim()) {
                    alert("Please enter a department.");
                    return;
                }


                const duration = prompt("Enter course duration:");

                if (!duration || !duration.trim()) return;


                const credits = prompt("Enter course credits:");

                if (!credits || !credits.trim()) return;

                if (!/^\d+$/.test(credits.trim())) {
                    alert("Please enter credits as a whole number.");
                    return;
                }


                // CREATE COURSE ROW
                const newRow = document.createElement("tr");

                const values = [
                    generateCourseID(),
                    name.trim(),
                    department.trim(),
                    duration.trim(),
                    credits.trim()
                ];

                values.forEach(value => {

                    const cell = document.createElement("td");

                    cell.textContent = value;

                    newRow.appendChild(cell);
                });


                // COURSE STATUS
                const statusCell = document.createElement("td");

                const statusBadge = document.createElement("span");

                statusBadge.className =
                    "course-status active-status";

                statusBadge.textContent = "Active";

                statusCell.appendChild(statusBadge);

                newRow.appendChild(statusCell);


                // DELETE BUTTON
                const actionCell = document.createElement("td");

                const deleteButton = document.createElement("button");

                deleteButton.className = "course-delete-btn";

                deleteButton.textContent = "Delete";

                deleteButton.type = "button";

                actionCell.appendChild(deleteButton);

                newRow.appendChild(actionCell);


                // ADD ROW TO TABLE
                courseTable.appendChild(newRow);


                // UPDATE PAGE
                updateCourseStats();

                // Clear filters to show the newly added course.
                if (courseSearch) {
                    courseSearch.value = "";
                }

                departmentFilter.value = "";

                filterCourses();

                alert("Course added successfully!");

            });
        }


        // =================================
        // DELETE COURSE
        // =================================

        courseTable.addEventListener("click", function (event) {

            if (
                event.target.classList.contains("course-delete-btn")
            ) {

                if (
                    confirm("Are you sure you want to delete this course?")
                ) {

                    event.target.closest("tr").remove();

                    updateCourseStats();

                    filterCourses();
                }
            }
        });


        // =================================
        // EVENT LISTENERS
        // =================================

        if (courseSearch) {
            courseSearch.addEventListener(
                "input",
                filterCourses
            );
        }

        departmentFilter.addEventListener(
            "input",
            filterCourses
        );


        // =================================
        // INITIAL LOAD
        // =================================

        updateCourseStats();

        filterCourses();

    })();



    /* =====================================
    CAMPUSIQ - RESOURCES MANAGEMENT
    ===================================== */

    const resourceTable = document.getElementById("resourceTableBody");
    const resourceSearch = document.getElementById("resourceSearch");
    const addResourceBtn = document.getElementById("addResourceBtn");

    if (resourceTable && resourceSearch && addResourceBtn) {

        const searchArea = document.querySelector(".resource-search-area");

        // Create dynamic Type filter
        const typeFilter = document.createElement("select");
        typeFilter.className = "resource-dynamic-filter";
        typeFilter.innerHTML = '<option value="">All Types</option>';

        // Create dynamic Location filter
        const locationFilter = document.createElement("select");
        locationFilter.className = "resource-dynamic-filter";
        locationFilter.innerHTML = '<option value="">All Locations</option>';

        searchArea.appendChild(typeFilter);
        searchArea.appendChild(locationFilter);

        // Update statistics
        function updateResourceStats() {
            const rows = [...resourceTable.querySelectorAll("tr")];

            document.getElementById("totalResources").textContent = rows.length;

            document.getElementById("availableResources").textContent =
                rows.filter(row => row.querySelector(".available-status")).length;

            document.getElementById("maintenanceResources").textContent =
                rows.filter(row => row.querySelector(".maintenance-status")).length;
        }

        // Refresh filter options from the table
        function updateResourceFilters() {
            const rows = [...resourceTable.querySelectorAll("tr")];

            const selectedType = typeFilter.value;
            const selectedLocation = locationFilter.value;

            const types = [...new Set(
                rows.map(row => row.cells[2].textContent.trim())
            )].sort();

            const locations = [...new Set(
                rows.map(row => row.cells[3].textContent.trim())
            )].sort();

            typeFilter.innerHTML = '<option value="">All Types</option>';
            locationFilter.innerHTML = '<option value="">All Locations</option>';

            types.forEach(type => {
                const option = document.createElement("option");
                option.value = type;
                option.textContent = type;
                typeFilter.appendChild(option);
            });

            locations.forEach(location => {
                const option = document.createElement("option");
                option.value = location;
                option.textContent = location;
                locationFilter.appendChild(option);
            });

            typeFilter.value = types.includes(selectedType) ? selectedType : "";
            locationFilter.value = locations.includes(selectedLocation)
                ? selectedLocation
                : "";
        }

        // Search and filter resources together
        function filterResources() {
            const searchValue = resourceSearch.value.toLowerCase().trim();
            const selectedType = typeFilter.value.toLowerCase();
            const selectedLocation = locationFilter.value.toLowerCase();

            resourceTable.querySelectorAll("tr").forEach(row => {
                const rowText = row.textContent.toLowerCase();
                const rowType = row.cells[2].textContent.trim().toLowerCase();
                const rowLocation = row.cells[3].textContent.trim().toLowerCase();

                const matchesSearch = rowText.includes(searchValue);
                const matchesType = !selectedType || rowType === selectedType;
                const matchesLocation =
                    !selectedLocation || rowLocation === selectedLocation;

                row.style.display =
                    matchesSearch && matchesType && matchesLocation ? "" : "none";
            });
        }

        resourceSearch.addEventListener("input", filterResources);
        typeFilter.addEventListener("change", filterResources);
        locationFilter.addEventListener("change", filterResources);

        // Add Resource
        addResourceBtn.addEventListener("click", function () {

            const name = prompt("Enter resource name:");
            if (!name || !name.trim()) return;

            const type = prompt("Enter resource type (any type is allowed):");
            if (!type || !type.trim()) return;

            const location = prompt("Enter resource location:");
            if (!location || !location.trim()) return;

            const capacity = prompt("Enter capacity:");
            if (!capacity || !capacity.trim()) return;

            if (!/^\d+$/.test(capacity.trim())) {
                alert("Please enter capacity as a number.");
                return;
            }

            const resourceId = "RES" + Date.now().toString().slice(-5);
            const newRow = document.createElement("tr");

            [resourceId, name.trim(), type.trim(), location.trim(), capacity.trim()]
                .forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    newRow.appendChild(cell);
                });

            const statusCell = document.createElement("td");
            const status = document.createElement("span");
            status.className = "resource-status available-status";
            status.textContent = "Available";
            statusCell.appendChild(status);
            newRow.appendChild(statusCell);

            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.className = "resource-delete-btn";
            deleteButton.textContent = "Delete";
            actionCell.appendChild(deleteButton);
            newRow.appendChild(actionCell);

            resourceTable.appendChild(newRow);

            updateResourceStats();
            updateResourceFilters();
            filterResources();
        });

        // Delete Resource
        resourceTable.addEventListener("click", function (event) {

            if (event.target.classList.contains("resource-delete-btn")) {

                if (confirm("Are you sure you want to delete this resource?")) {
                    event.target.closest("tr").remove();

                    updateResourceStats();
                    updateResourceFilters();
                    filterResources();
                }
            }
        });

        // Initial setup
        updateResourceStats();
        updateResourceFilters();
        filterResources();
    }


    /* ==========================================
        CAMPUSIQ - ACTIVITIES MANAGEMENT
    ========================================== */

    (function () {

        function initActivities() {

            const table = document.getElementById("activityTableBody");

            if (!table) return;

            const search = document.getElementById("activitySearch");
            const categoryFilter = document.getElementById("activityTypeFilter");
            const statusFilter = document.getElementById("activityStatusFilter");
            const dateFilter = document.getElementById("activityDateFilter");

            const addButton = document.getElementById("addActivityBtn");
            const modal = document.getElementById("activityModal");
            const form = document.getElementById("activityForm");

            const modalTitle = document.getElementById("activityModalTitle");
            const editId = document.getElementById("activityEditId");

            const closeButton = document.getElementById("closeActivityModal");
            const cancelButton = document.getElementById("cancelActivityBtn");
            const saveButton = document.getElementById("saveActivityBtn");

            const totalCount = document.getElementById("totalActivities");
            const upcomingCount = document.getElementById("upcomingActivities");
            const completedCount = document.getElementById("completedActivities");
            const emptyMessage = document.getElementById("activityEmptyMessage");

            const nameInput = document.getElementById("activityName");
            const categoryInput = document.getElementById("activityType");
            const dateInput = document.getElementById("activityDate");

            const timeInput =
                document.getElementById("activityTimeInput") ||
                document.getElementById("activityTime");

            const periodInput = document.getElementById("activityTimePeriod");

            const venueInput = document.getElementById("activityVenue");
            const organizerInput = document.getElementById("activityOrganizer");
            const capacityInput = document.getElementById("activityCapacity");
            const descriptionInput = document.getElementById("activityDescription");

            if (
                !form || !modal || !addButton ||
                !nameInput || !categoryInput || !dateInput ||
                !timeInput || !venueInput || !organizerInput ||
                !capacityInput
            ) {
                alert("Activities page: Required HTML elements are missing.");
                return;
            }

            if (saveButton) saveButton.type = "submit";

            const API_URL = "/api/activities";

            let activities = [];

            /* DATABASE REQUEST - JAVA FORM DATA */

            async function apiRequest(url, method = "GET", data = null) {

                const options = {
                    method: method,
                    credentials: "include",
                    headers: {}
                };

                if (data !== null) {

                    options.headers["Content-Type"] =
                        "application/x-www-form-urlencoded;charset=UTF-8";

                    options.body = new URLSearchParams(data).toString();
                }

                const response = await fetch(url, options);

                if (response.status === 401) {
                    window.location.href = "login.html";
                    throw new Error("Please log in again.");
                }

                const responseText = await response.text();

                if (!response.ok) {

                    let message = responseText;

                    try {
                        const result = JSON.parse(responseText);
                        message = result.message || responseText;
                    } catch (error) {
                        // Keep original response message.
                    }

                    throw new Error(message || "Database request failed.");
                }

                if (!responseText) return null;

                try {
                    return JSON.parse(responseText);
                } catch (error) {
                    return responseText;
                }
            }

            /* LOAD ACTIVITIES FROM JAVA DATABASE */

            async function getActivities() {

                try {

                    const data = await apiRequest(API_URL);

                    return Array.isArray(data) ? data.map(item => ({

                        id: String(item.id),
                        name: item.name || "",
                        type: item.type || "",
                        date: item.date || "",
                        time: item.time || "",
                        venue: item.venue || item.location || "",
                        organizer: item.organizer || "",
                        capacity: item.capacity ?? "",
                        description: item.description || ""

                    })) : [];

                } catch (error) {

                    alert("Loading activities failed: " + error.message);
                    return [];
                }
            }

            /* DATE HELPERS */

            function parseDate(value) {

                if (!value) return null;

                const parts = value.split("-").map(Number);

                let year, month, day;

                if (parts[0] > 31) {
                    [year, month, day] = parts;
                } else {
                    [day, month, year] = parts;
                }

                const date = new Date(year, month - 1, day);

                if (
                    date.getFullYear() !== year ||
                    date.getMonth() !== month - 1 ||
                    date.getDate() !== day
                ) {
                    return null;
                }

                return date;
            }

            function formatDate(date) {

                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");

                return `${year}-${month}-${day}`;
            }

            function displayDate(value) {

                const date = parseDate(value);

                if (!date) return value || "-";

                return date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });
            }

            /* TIME HELPERS */

            function getTimeValue() {

                const time = timeInput.value.trim();

                if (!time) return "";

                return periodInput
                    ? `${time} ${periodInput.value}`
                    : time;
            }

            function setTimeValue(value) {

                if (!value) {
                    timeInput.value = "";
                    if (periodInput) periodInput.value = "AM";
                    return;
                }

                const match = value.match(
                    /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
                );

                if (match) {

                    timeInput.value =
                        `${match[1].padStart(2, "0")}:${match[2]}`;

                    if (periodInput && match[3]) {
                        periodInput.value = match[3].toUpperCase();
                    }

                } else {
                    timeInput.value = value;
                }
            }

            function validTime() {

                const value = timeInput.value.trim();

                if (!/^(0?[1-9]|1[0-2]):[0-5]\d$/.test(value)) {
                    return false;
                }

                return !periodInput ||
                    ["AM", "PM"].includes(periodInput.value);
            }

            /* ACTIVITY STATUS */

            function getStatus(dateValue) {

                const activityDate = parseDate(dateValue);

                if (!activityDate) return "Upcoming";

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                activityDate.setHours(0, 0, 0, 0);

                if (activityDate < today) return "Completed";
                if (activityDate.getTime() === today.getTime()) return "Ongoing";

                return "Upcoming";
            }

            function statusClass(status) {

                if (status === "Completed") return "completed-status";
                if (status === "Ongoing") return "ongoing-status";

                return "upcoming-status";
            }

            /* TABLE */

            function makeCell(value) {

                const cell = document.createElement("td");
                cell.textContent = value || "-";

                return cell;
            }

            function createRow(activity) {

                const row = document.createElement("tr");

                row.dataset.activityId = activity.id;

                row.appendChild(makeCell(activity.id));
                row.appendChild(makeCell(activity.name));
                row.appendChild(makeCell(activity.type));
                row.appendChild(makeCell(displayDate(activity.date)));
                row.appendChild(makeCell(activity.time));
                row.appendChild(makeCell(activity.venue));
                row.appendChild(makeCell(activity.organizer));
                row.appendChild(makeCell(activity.capacity));

                const statusCell = document.createElement("td");
                const badge = document.createElement("span");

                const status = getStatus(activity.date);

                badge.className = "activity-status " + statusClass(status);
                badge.textContent = status;

                statusCell.appendChild(badge);
                row.appendChild(statusCell);

                const actions = document.createElement("td");

                const edit = document.createElement("button");
                edit.type = "button";
                edit.className = "activity-edit-btn";
                edit.textContent = "Edit";

                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "activity-delete-btn";
                remove.textContent = "Delete";

                actions.appendChild(edit);
                actions.appendChild(remove);

                row.appendChild(actions);

                return row;
            }

            /* STATISTICS */

            function updateStats() {

                if (totalCount) {
                    totalCount.textContent = activities.length;
                }

                if (upcomingCount) {
                    upcomingCount.textContent = activities.filter(
                        item => getStatus(item.date) === "Upcoming"
                    ).length;
                }

                if (completedCount) {
                    completedCount.textContent = activities.filter(
                        item => getStatus(item.date) === "Completed"
                    ).length;
                }
            }

            /* CATEGORY FILTER */

            function updateCategories() {

                if (!categoryFilter) return;

                const previous = categoryFilter.value;

                const categories = [
                    ...new Set(
                        activities.map(item => item.type).filter(Boolean)
                    )
                ].sort();

                categoryFilter.innerHTML =
                    '<option value="">All Categories</option>';

                categories.forEach(category => {

                    const option = document.createElement("option");

                    option.value = category;
                    option.textContent = category;

                    categoryFilter.appendChild(option);
                });

                categoryFilter.value = categories.includes(previous)
                    ? previous
                    : "";
            }

            /* RENDER ACTIVITY DIRECTORY - NUMERIC ID ORDER */

            function renderActivities() {

                const searchValue =
                    search ? search.value.trim().toLowerCase() : "";

                const selectedCategory =
                    categoryFilter ? categoryFilter.value : "";

                const selectedStatus =
                    statusFilter ? statusFilter.value : "";

                const selectedDate =
                    dateFilter ? dateFilter.value : "";

                table.innerHTML = "";

                let visibleCount = 0;

                [...activities]
                    .sort((a, b) => Number(a.id) - Number(b.id))
                    .forEach(activity => {

                        const status = getStatus(activity.date);

                        const searchable = [
                            activity.id,
                            activity.name,
                            activity.type,
                            activity.date,
                            activity.time,
                            activity.venue,
                            activity.organizer,
                            activity.description
                        ].join(" ").toLowerCase();

                        const matches =
                            searchable.includes(searchValue) &&
                            (!selectedCategory ||
                                activity.type === selectedCategory) &&
                            (!selectedStatus || status === selectedStatus) &&
                            (!selectedDate || activity.date === selectedDate);

                        if (matches) {
                            table.appendChild(createRow(activity));
                            visibleCount++;
                        }
                    });

                if (emptyMessage) {
                    emptyMessage.hidden = visibleCount !== 0;
                }

                if (visibleCount === 0) {

                    const row = document.createElement("tr");
                    const cell = document.createElement("td");

                    cell.colSpan = 10;

                    cell.textContent = activities.length === 0
                        ? "No activities found. Click + Add Activity to create one."
                        : "No activities match your search or filters.";

                    cell.style.textAlign = "center";
                    cell.style.padding = "25px";

                    row.appendChild(cell);
                    table.appendChild(row);
                }

                updateStats();
                updateCategories();
            }

            async function refreshActivities() {

                activities = await getActivities();
                renderActivities();
            }

            /* OPEN MODAL */

            function openModal(activity = null) {

                form.reset();
                editId.value = "";

                if (activity) {

                    modalTitle.textContent = "Edit Activity";

                    editId.value = activity.id;
                    nameInput.value = activity.name;
                    categoryInput.value = activity.type;

                    dateInput.value = formatDate(
                        parseDate(activity.date) || new Date()
                    );

                    setTimeValue(activity.time);

                    venueInput.value = activity.venue;
                    organizerInput.value = activity.organizer;
                    capacityInput.value = activity.capacity;

                    if (descriptionInput) {
                        descriptionInput.value = activity.description;
                    }

                } else {

                    modalTitle.textContent = "Add New Activity";

                    if (periodInput) {
                        periodInput.value = "AM";
                    }
                }

                modal.hidden = false;
            }

            function closeModal() {

                modal.hidden = true;
                form.reset();
                editId.value = "";
            }

            /* BUTTON EVENTS */

            addButton.addEventListener("click", function (event) {

                event.preventDefault();
                openModal();
            });

            if (closeButton) {
                closeButton.addEventListener("click", closeModal);
            }

            if (cancelButton) {
                cancelButton.addEventListener("click", closeModal);
            }

            modal.addEventListener("click", function (event) {

                if (event.target === modal) {
                    closeModal();
                }
            });

            /* ADD AND UPDATE ACTIVITIES */

            form.addEventListener("submit", async function (event) {

                event.preventDefault();

                const name = nameInput.value.trim();
                const type = categoryInput.value;
                const date = dateInput.value;
                const time = getTimeValue();
                const venue = venueInput.value.trim();
                const organizer = organizerInput.value.trim();
                const capacity = Number(capacityInput.value);

                const description = descriptionInput
                    ? descriptionInput.value.trim()
                    : "";

                if (
                    !name || !type || !date ||
                    !venue || !organizer ||
                    !capacityInput.value ||
                    !Number.isInteger(capacity) ||
                    capacity < 1
                ) {
                    alert("Please fill in all required fields correctly.");
                    return;
                }

                if (!parseDate(date)) {
                    alert("Please select a valid activity date.");
                    return;
                }

                if (!validTime()) {
                    alert("Enter a valid time, for example 09:30, and select AM or PM.");
                    timeInput.focus();
                    return;
                }

                const activityData = {
                    name: name,
                    type: type,
                    date: date,
                    time: time,
                    venue: venue,
                    organizer: organizer,
                    capacity: String(capacity),
                    description: description
                };

                const existingId = editId.value;

                try {

                    if (existingId) {

                        await apiRequest(
                            `${API_URL}/${encodeURIComponent(existingId)}`,
                            "PUT",
                            activityData
                        );

                    } else {

                        await apiRequest(
                            API_URL,
                            "POST",
                            activityData
                        );
                    }

                    closeModal();
                    await refreshActivities();

                    alert(existingId
                        ? "Activity updated successfully!"
                        : "Activity added successfully!");

                } catch (error) {

                    alert("Could not save activity: " + error.message);
                }
            });

            /* EDIT AND DELETE */

            table.addEventListener("click", async function (event) {

                const row = event.target.closest("tr");

                if (!row) return;

                const id = row.dataset.activityId;

                if (!id) return;

                const activity = activities.find(
                    item => item.id === id
                );

                if (!activity) return;

                if (event.target.classList.contains("activity-edit-btn")) {

                    openModal(activity);
                }

                if (event.target.classList.contains("activity-delete-btn")) {

                    if (!confirm("Are you sure you want to delete this activity?")) {
                        return;
                    }

                    try {

                        await apiRequest(
                            `${API_URL}/${encodeURIComponent(id)}`,
                            "DELETE"
                        );

                        await refreshActivities();

                        alert("Activity deleted successfully!");

                    } catch (error) {

                        alert("Could not delete activity: " + error.message);
                    }
                }
            });

            /* SEARCH AND FILTERS */

            if (search) {
                search.addEventListener("input", renderActivities);
            }

            if (categoryFilter) {
                categoryFilter.addEventListener("change", renderActivities);
            }

            if (statusFilter) {
                statusFilter.addEventListener("change", renderActivities);
            }

            if (dateFilter) {
                dateFilter.addEventListener("change", renderActivities);
            }

            /* INITIAL DISPLAY */

            refreshActivities();

        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initActivities);
        } else {
            initActivities();
        }

    })();


    
/* ==========================================
   CAMPUSIQ - BOOKINGS MANAGEMENT
   Java Backend + SQLite Database
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const API_URL = "/api/bookings";

    const tableBody = document.getElementById("bookingTableBody");
    const searchInput = document.getElementById("bookingSearch");
    const resourceFilter = document.getElementById("bookingResourceFilter");
    const statusFilter = document.getElementById("bookingStatusFilter");
    const dateFilter = document.getElementById("bookingDateFilter");

    const modal = document.getElementById("bookingModal");
    const form = document.getElementById("bookingForm");
    const addButton = document.getElementById("addBookingBtn");
    const closeButton = document.getElementById("closeBookingModal");
    const cancelButton = document.getElementById("cancelBookingBtn");

    if (!tableBody || !form || !modal) return;

    let bookings = [];

    const fields = {
        editId: document.getElementById("bookingEditId"),
        person: document.getElementById("bookingPerson"),
        resource: document.getElementById("bookingResource"),
        date: document.getElementById("bookingDate"),
        start: document.getElementById("bookingStartTime"),
        end: document.getElementById("bookingEndTime"),
        status: document.getElementById("bookingStatus")
    };

    /* ==========================================
       API REQUEST
       ========================================== */

    async function apiRequest(method = "GET", data = null, id = null) {

        let url = API_URL;

        if (id !== null) {
            url += "/" + encodeURIComponent(id);
        }

        const options = {
            method: method,
            credentials: "include",
            headers: {}
        };

        if (data) {
            options.headers["Content-Type"] =
                "application/x-www-form-urlencoded";

            options.body = new URLSearchParams(data).toString();
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Request failed.");
        }

        if (response.status === 204) return null;

        const text = await response.text();

        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }

    /* ==========================================
       LOAD BOOKINGS FROM DATABASE
       ========================================== */

    async function loadBookings() {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    Loading bookings...
                </td>
            </tr>
        `;

        try {

            const result = await apiRequest("GET");

            bookings = Array.isArray(result)
                ? result
                : Array.isArray(result?.bookings)
                    ? result.bookings
                    : [];

            renderBookings();

        } catch (error) {

            console.error("Booking loading failed:", error);

            bookings = [];

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;">
                        Unable to load bookings. Please check the Java server.
                    </td>
                </tr>
            `;

            updateStats();
        }
    }

    /* ==========================================
       HELPER FUNCTIONS
       ========================================== */

    function escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, function (char) {

            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];

        });
    }

    function getStatusClass(status) {

        return {
            Approved: "approved-status",
            Pending: "pending-status",
            Rejected: "rejected-status",
            Cancelled: "cancelled-status"
        }[status] || "pending-status";
    }

    function formatDate(dateString) {

        if (!dateString) return "—";

        const date = new Date(dateString + "T00:00:00");

        if (Number.isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function updateStats() {

        document.getElementById("totalBookings").textContent =
            bookings.length;

        document.getElementById("approvedBookings").textContent =
            bookings.filter(item => item.status === "Approved").length;

        document.getElementById("pendingBookings").textContent =
            bookings.filter(item => item.status === "Pending").length;
    }

    /* ==========================================
       RESOURCE FILTER
       ========================================== */

    function updateResourceFilter() {

        if (!resourceFilter) return;

        const selected = resourceFilter.value;

        const resources = [...new Set(
            bookings.map(item => item.resource).filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));

        resourceFilter.innerHTML =
            '<option value="">All Resources</option>' +

            resources.map(resource => `
                <option value="${escapeHTML(resource)}">
                    ${escapeHTML(resource)}
                </option>
            `).join("");

        if (resources.includes(selected)) {
            resourceFilter.value = selected;
        }
    }

    /* ==========================================
       FILTER BOOKINGS
       ========================================== */

    function getFilteredBookings() {

        const search = searchInput.value.trim().toLowerCase();
        const resource = resourceFilter.value;
        const status = statusFilter.value;
        const date = dateFilter.value;

        return bookings.filter(item => {

            const matchesSearch =
                String(item.id).toLowerCase().includes(search) ||
                String(item.person).toLowerCase().includes(search) ||
                String(item.resource).toLowerCase().includes(search);

            return matchesSearch &&
                (!resource || item.resource === resource) &&
                (!status || item.status === status) &&
                (!date || item.date === date);

        });
    }

    /* ==========================================
       DISPLAY BOOKINGS
       ========================================== */

    function renderBookings() {

        const filtered = getFilteredBookings();

        tableBody.innerHTML = filtered.map(item => `

            <tr>

                <td>
                    <strong>${escapeHTML(item.id)}</strong>
                </td>

                <td>${escapeHTML(item.person)}</td>

                <td>${escapeHTML(item.resource)}</td>

                <td>${escapeHTML(formatDate(item.date))}</td>

                <td>
                    ${escapeHTML(item.startTime || "—")}
                    -
                    ${escapeHTML(item.endTime || "—")}
                </td>

                <td>
                    <span class="booking-status ${getStatusClass(item.status)}">
                        ${escapeHTML(item.status)}
                    </span>
                </td>

                <td>
                    <div class="booking-action-buttons">

                        <button class="booking-action edit-action"
                            data-action="edit"
                            data-id="${escapeHTML(item.id)}">
                            Edit
                        </button>

                        ${item.status !== "Approved" &&
                          item.status !== "Cancelled" ? `
                            <button class="booking-action approve-action"
                                data-action="approve"
                                data-id="${escapeHTML(item.id)}">
                                Approve
                            </button>
                        ` : ""}

                        ${item.status !== "Rejected" &&
                          item.status !== "Cancelled" ? `
                            <button class="booking-action reject-action"
                                data-action="reject"
                                data-id="${escapeHTML(item.id)}">
                                Reject
                            </button>
                        ` : ""}

                        ${item.status !== "Cancelled" ? `
                            <button class="booking-action cancel-action"
                                data-action="cancel"
                                data-id="${escapeHTML(item.id)}">
                                Cancel
                            </button>
                        ` : ""}

                        <button class="booking-action delete-action"
                            data-action="delete"
                            data-id="${escapeHTML(item.id)}">
                            Delete
                        </button>

                    </div>
                </td>

            </tr>

        `).join("");

        const emptyMessage =
            document.getElementById("bookingEmptyMessage");

        if (emptyMessage) {
            emptyMessage.style.display =
                filtered.length ? "none" : "block";
        }

        updateStats();
        updateResourceFilter();
    }

    /* ==========================================
       OPEN AND CLOSE MODAL
       ========================================== */

    function openModal(booking = null) {

        form.reset();
        fields.editId.value = "";

        if (booking) {

            document.getElementById("bookingModalTitle").textContent =
                "Edit Booking";

            fields.editId.value = booking.id;
            fields.person.value = booking.person;
            fields.resource.value = booking.resource;
            fields.date.value = booking.date;
            fields.start.value = booking.startTime;
            fields.end.value = booking.endTime;
            fields.status.value = booking.status;

        } else {

            document.getElementById("bookingModalTitle").textContent =
                "Add New Booking";

            fields.status.value = "Pending";
        }

        modal.classList.add("show");
    }

    function closeModal() {

        modal.classList.remove("show");

        form.reset();

        fields.editId.value = "";
    }

    /* ==========================================
       CHECK TIME CONFLICT
       ========================================== */

    function hasTimeConflict(newBooking, editingId) {

        if (["Rejected", "Cancelled"].includes(newBooking.status)) {
            return false;
        }

        return bookings.some(existing => {

            if (String(existing.id) === String(editingId)) {
                return false;
            }

            if (["Rejected", "Cancelled"].includes(existing.status)) {
                return false;
            }

            const sameResource =
                existing.resource.trim().toLowerCase() ===
                newBooking.resource.trim().toLowerCase();

            const sameDate = existing.date === newBooking.date;

            const overlaps =
                newBooking.startTime < existing.endTime &&
                newBooking.endTime > existing.startTime;

            return sameResource && sameDate && overlaps;

        });
    }

    /* ==========================================
       ADD OR UPDATE BOOKING
       ========================================== */

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const editingId = fields.editId.value;

        const bookingData = {

            person: fields.person.value.trim(),

            resource: fields.resource.value.trim(),

            date: fields.date.value,

            startTime: fields.start.value,

            endTime: fields.end.value,

            status: fields.status.value

        };

        if (!bookingData.person ||
            !bookingData.resource ||
            !bookingData.date ||
            !bookingData.startTime ||
            !bookingData.endTime) {

            alert("Please fill in all booking details.");

            return;
        }

        if (bookingData.endTime <= bookingData.startTime) {

            alert("End time must be later than start time.");

            return;
        }

        if (hasTimeConflict(bookingData, editingId)) {

            alert(
                "This resource already has a booking during that time. Please choose another time."
            );

            return;
        }

        try {

            if (editingId) {

                await apiRequest("PUT", bookingData, editingId);

            } else {

                await apiRequest("POST", bookingData);

            }

            closeModal();

            await loadBookings();

            alert(
                editingId
                    ? "Booking updated successfully!"
                    : "Booking added successfully!"
            );

        } catch (error) {

            console.error("Booking save failed:", error);

            alert("Unable to save booking. Please check the Java backend.");

        }

    });

    /* ==========================================
       EDIT, APPROVE, REJECT, CANCEL, DELETE
       ========================================== */

    tableBody.addEventListener("click", async function (event) {

        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = button.dataset.id;

        const action = button.dataset.action;

        const booking = bookings.find(
            item => String(item.id) === String(id)
        );

        if (!booking) return;

        if (action === "edit") {

            openModal(booking);

            return;
        }

        try {

            if (action === "delete") {

                if (!confirm("Are you sure you want to delete this booking?")) {
                    return;
                }

                await apiRequest("DELETE", null, id);
            }

            if (action === "approve") {

                const updated = {
                    ...booking,
                    status: "Approved"
                };

                if (hasTimeConflict(updated, id)) {

                    alert(
                        "Another active booking already uses this resource during that time."
                    );

                    return;
                }

                await apiRequest("PUT", {
                    ...booking,
                    status: "Approved"
                }, id);
            }

            if (action === "reject") {

                if (!confirm("Reject this booking?")) return;

                await apiRequest("PUT", {
                    ...booking,
                    status: "Rejected"
                }, id);
            }

            if (action === "cancel") {

                if (!confirm("Cancel this booking?")) return;

                await apiRequest("PUT", {
                    ...booking,
                    status: "Cancelled"
                }, id);
            }

            await loadBookings();

        } catch (error) {

            console.error("Booking action failed:", error);

            alert("Unable to complete this action. Please check the Java backend.");

        }

    });

    /* ==========================================
       SEARCH AND FILTER EVENTS
       ========================================== */

    [
        searchInput,
        resourceFilter,
        statusFilter,
        dateFilter
    ].filter(Boolean).forEach(control => {

        control.addEventListener("input", renderBookings);

        control.addEventListener("change", renderBookings);

    });

    /* ==========================================
       MODAL EVENTS
       ========================================== */

    if (addButton) {
        addButton.addEventListener("click", () => openModal());
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeModal);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", event => {

        if (event.target === modal) {
            closeModal();
        }

    });

    /* ==========================================
       INITIAL LOAD
       ========================================== */

    loadBookings();

});
