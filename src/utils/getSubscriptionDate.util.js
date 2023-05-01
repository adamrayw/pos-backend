function getSubscriptionEndDate(level) {
    const now = new Date();

    if (level === "Basic") {
        // Add 1 month to the current date
        now.setMonth(now.getMonth() + 1);
    } else if (level === "Plus") {
        // Add 1 year to the current date
        now.setFullYear(now.getFullYear() + 1);
    } else if (level === "Pro") {
        // Add 3 months to the current date
        now.setMonth(now.getMonth() + 3);
    }

    return now;
}

module.exports = getSubscriptionEndDate;