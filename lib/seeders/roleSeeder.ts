import roleService from "../services/role.service"

export default async function seedRoles() {
    await roleService.bulkInsert([
        {
            name: 'Creator',
            description: '',
            type: 'USER',
            role: 'CREATOR',
        },
        {
            name: 'Brand',
            description: '',
            type: 'USER',
            role: 'BRAND',
        },
        {
            name: 'Admin',
            description: '',
            type: 'ADMIN',
            role: 'ADMIN',
        },
    ])
}
