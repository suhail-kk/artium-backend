import { s3GetURL } from '@/lib/utils/s3utils'
import AdditionalProjects from '@/lib/schemas/additionalProjects'
import { IAdditionalProjects } from '@/lib/types/additionalProjects.interface'

const createAdditionalProject = async (data: IAdditionalProjects) => {
    const res = await AdditionalProjects.create(data)
    return res
}

const bulkInsertAdditionalProject = async (data: IAdditionalProjects[]) => {
    const res = await AdditionalProjects.insertMany(data)
    return res
}


const updateAdditionalProject = async (id: string, data: IAdditionalProjects) => {
    const res = await AdditionalProjects.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const getAdditionalProjects = async (page: number, limit: number) => {

    const res = await AdditionalProjects.aggregate([
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
        {
            $sort: { createdAt: -1 },
        },
    ])

    const count = await AdditionalProjects.aggregate([
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
        count: count[0]?.total,
    }
}

const deleteAdditionalProject = async (_id: string) => {
    const res = await AdditionalProjects.findByIdAndDelete(_id)
    return res
}

export default { createAdditionalProject, updateAdditionalProject, getAdditionalProjects, deleteAdditionalProject, bulkInsertAdditionalProject }
