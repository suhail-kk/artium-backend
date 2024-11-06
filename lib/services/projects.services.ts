import { s3GetURL } from '@/lib/utils/s3utils'
import projects from '@/lib/schemas/projects'
import { IProjects } from '@/lib/types/projects.interface'
import mongoose from 'mongoose'

const createProject = async (data: IProjects) => {
    const res = await projects.create(data)
    return res
}

const bulkInsertProject = async (data: IProjects[]) => {
    const res = await projects.insertMany(data)
    return res
}

const ProjectsCount = async (type: string) => {
    const res = await projects.countDocuments({ type });
    return res
}


const updateProject = async (id: string, data: IProjects) => {
    const res = await projects.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const getprojects = async ({ page, limit, type, user_id }: { page: number, limit: number, type: string, user_id: string }) => {

    const res = await projects.aggregate([
        {
            $match: { type }
        },
        {
            $match: {
                user_id: new mongoose.Types.ObjectId(user_id),
            },
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        }
    ])

    const count = await projects.aggregate([
        {
            $match: { type }
        },
        {
            $count: 'total',
        },
    ])

    const urls = res.map(project => {
        project.url = s3GetURL(project?.url)
        return project;
    });

    return {
        data: urls,
        count: count[0]?.total || 0,
    }
}

const deleteProject = async (_id: string) => {
    const res = await projects.findByIdAndDelete(_id)
    return res
}

export default { createProject, ProjectsCount, updateProject, getprojects, deleteProject, bulkInsertProject }
