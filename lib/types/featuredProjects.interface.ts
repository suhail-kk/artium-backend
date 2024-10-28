import { Types } from 'mongoose'

export interface IFeaturedProjects {
    title: string,
    url: string,
    user_id: Types.ObjectId
}
