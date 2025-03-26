import EventType from "@/lib/schemas/eventType"
import { IEventType } from "@/lib/types/eventType.interface"
import mongoose from "mongoose";

const bulkInsert = async (data: IEventType[]) => {
    return await EventType.insertMany(data)
}

const isExistById = async (_id: mongoose.Types.ObjectId) => {
    const res = await EventType.exists({ _id });
    return res;
};

const getAll = async () => {
    const res = await EventType.find()
    return res
}

export default {
    getAll,
    bulkInsert,
    isExistById
}