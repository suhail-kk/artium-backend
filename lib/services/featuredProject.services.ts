import { s3GetURL } from '@/lib/utils/s3utils'
import FeaturedProjects from '@/lib/schemas/featuredProjects'
import { IFeaturedProjects } from '@/lib/types/featuredProjects.interface'

const createFeaturedProject = async (data: IFeaturedProjects) => {
    const res = await FeaturedProjects.create(data)
    return res
}

const featuredProjectCount = async () => {
    const res = await FeaturedProjects.count()
    return res
}

const bulkInsertFeaturedProject = async (data: IFeaturedProjects[]) => {
    const res = await FeaturedProjects.insertMany(data)
    return res
}


const updateFeaturedProject = async (id: string, data: IFeaturedProjects) => {
    const res = await FeaturedProjects.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const getFeaturedProjects = async (page: number, limit: number) => {

    const res = await FeaturedProjects.aggregate([
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

    const count = await FeaturedProjects.aggregate([
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

const deleteFeaturedProject = async (_id: string) => {
    const res = await FeaturedProjects.findByIdAndDelete(_id)
    return res
}

export default { createFeaturedProject, featuredProjectCount, updateFeaturedProject, getFeaturedProjects, deleteFeaturedProject, bulkInsertFeaturedProject }
