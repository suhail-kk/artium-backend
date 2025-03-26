import { Types } from 'mongoose'

export interface IReport {
    reason: string,
    event_id: Types.ObjectId,
    reported_user: Types.ObjectId,
    reporting_user: Types.ObjectId,
}

export interface IUpdateReportStatus {
    status: string,
}

