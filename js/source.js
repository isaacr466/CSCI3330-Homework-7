$(function () {

    let currentPage = 1;
    let totalPages = 1;

    // Format currency
    function formatMoney(amount) {
        return Number(amount).toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
    }

    // Format customer date
    function formatDate(date) {
        if (!date) return "";

        const parts = date.substring(0, 10).split("-");

        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }

    // Load dashboard data
    async function loadDashboard(page = 1) {
        try {
            const response = await fetch(
                `/api/dashboard?page=${page}`
            );

            if (!response.ok) {
                throw new Error("Failed to load dashboard data");
            }

            const data = await response.json();

            currentPage = data.page;
            totalPages = data.totalPages;

            // Dashboard statistics
            $("#username").text("UTRGV Vaqueros");

            $(".revenue-amt").text(
                formatMoney(data.revenue)
            );

            $("#customer-num").text(
                data.customerCount.toLocaleString()
            );

            $("#orders-amt").text(
                data.orders.toLocaleString()
            );

            $("#issues-amt").text(data.issueCount);

            $("#notification-num").text(
                data.notificationCount
            );

            // Display customers
            const customerTable = $("#customerTableBody");
            customerTable.empty();

            data.customers.forEach(customer => {
                const row = $("<tr>");

                const status = customer.status || "";

                const statusClass =
                    status.toLowerCase() === "active"
                        ? "status-active"
                        : "status-pending";

                $("<td>")
                    .text(customer.name)
                    .appendTo(row);

                $("<td>")
                    .text(customer.email)
                    .appendTo(row);

                const statusCell = $("<td>");

                $("<span>")
                    .addClass(`status ${statusClass}`)
                    .text(status)
                    .appendTo(statusCell);

                row.append(statusCell);

                $("<td>")
                    .text(formatDate(customer.datejoined))
                    .appendTo(row);

                customerTable.append(row);
            });

            // Display sales
            const salesTable = $("#salesTableBody");
            salesTable.empty();

            data.sales.forEach(sale => {
                const row = $("<tr>");

                $("<td>")
                    .text(sale.name || "Unknown")
                    .appendTo(row);

                $("<td>")
                    .text(sale.quantity)
                    .appendTo(row);

                $("<td>")
                    .text(formatMoney(sale.saleamount))
                    .appendTo(row);

                salesTable.append(row);
            });

            // Display issues
            const issuesList = $("#system-status-list");
            issuesList.empty();

            data.issues.forEach(issue => {
                $("<li>")
                    .text(issue.description)
                    .appendTo(issuesList);
            });

            // Display notifications
            const notificationsList = $("#notifications-list");
            notificationsList.empty();

            data.notifications.forEach(notification => {
                $("<li>")
                    .text(notification.description)
                    .appendTo(notificationsList);
            });

            // Display tasks
            const tasksList = $("#tasks-list");
            tasksList.empty();

            data.tasks.forEach(task => {
                $("<li>")
                    .text(task.description)
                    .appendTo(tasksList);
            });

            // Update pagination
            $("#pageInfo").text(
                `Page ${currentPage} of ${totalPages}`
            );

            $("#prevPage").button(
                "option",
                "disabled",
                currentPage <= 1
            );

            $("#nextPage").button(
                "option",
                "disabled",
                currentPage >= totalPages
            );

        } catch (error) {
            console.error("Dashboard error:", error);
            alert("Unable to load dashboard data.");
        }
    }

    // Initialize jQuery UI
    $("button").button();

    $("#dashboardTabs").tabs();

    $("#customerDate").datepicker();

    $("#accordion").accordion({
        collapsible: true,
        heightStyle: "content"
    });

    // Customer dialog
    $("#customerDialog").dialog({
        autoOpen: false,
        modal: true,
        width: 450,
        buttons: {
            "Create Customer": function () {
                const name = $("#customerName").val();
                const email = $("#customerEmail").val();

                if (!name || !email) {
                    alert("Please enter a name and email.");
                    return;
                }

                alert("Customer created: " + name);
                $(this).dialog("close");
            },

            "Cancel": function () {
                $(this).dialog("close");
            }
        }
    });

    // Open customer dialog
    $("#newCustomerButton").on("click", function () {
        $("#customerDialog").dialog("open");
    });

    // Previous customer page
    $("#prevPage").on("click", function () {
        if (currentPage > 1) {
            loadDashboard(currentPage - 1);
        }
    });

    // Next customer page
    $("#nextPage").on("click", function () {
        if (currentPage < totalPages) {
            loadDashboard(currentPage + 1);
        }
    });

    // Load first page
    loadDashboard(1);

});