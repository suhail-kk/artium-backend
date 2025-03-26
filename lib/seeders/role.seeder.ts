import Role from '@/lib/services/role.service'

export default async function seedRole() {
    await Role.bulkInsert([
        {
            name: "Admin",
            description: "Has complete access to manage users, events, and organizational settings. Responsible for overseeing the system and ensuring smooth operations.",
            type: "ADMIN",
            role: "ADMIN",
        },
        {
            name: "Team Lead",
            description: "Responsible for leading a team, coordinating activities, and ensuring that tasks are completed efficiently. Can manage team-specific events and monitor progress.",
            type: "USER",
            role: "Team Lead",
        },
        {
            name: "Student",
            description: "Participates in events and activities organized by the system. Can view schedules, apply for events, and check results or updates.",
            type: "USER",
            role: "STUDENT",
        },
        {
            name: "Faculty",
            description: "Can have access to the system, Not much role right now.",
            type: "USER",
            role: "FACULTY",
        },
    ])
}
