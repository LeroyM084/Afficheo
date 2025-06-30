class AnnouncementScheduler {
    constructor() {
        this.schedules = this.loadSchedules();
    }
    
    loadSchedules() {
        return JSON.parse(localStorage.getItem('schedules') || '[]');
    }
    
    saveSchedules() {
        localStorage.setItem('schedules', JSON.stringify(this.schedules));
    }
    
    addSchedule(schedule) {
        schedule.id = Date.now();
        schedule.createdAt = new Date().toISOString();
        this.schedules.push(schedule);
        this.saveSchedules();
    }
    
    removeSchedule(id) {
        this.schedules = this.schedules.filter(s => s.id !== id);
        this.saveSchedules();
    }
    
    getActiveSchedules() {
        const now = new Date();
        return this.schedules.filter(schedule => {
            return schedule.active && 
                   new Date(schedule.startDate) <= now && 
                   new Date(schedule.endDate) >= now;
        });
    }
}

// Initialiser
window.addEventListener('DOMContentLoaded', () => {
    window.announcementScheduler = new AnnouncementScheduler();
});
