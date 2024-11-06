import mongoose from "mongoose";

import User from "../schemas/user";
import Role from "../schemas/roles"; // Import Role model
import {  IupdateUser } from "../types/user";
import { s3GetURL } from "../utils/s3utils";
import s3paths from "../constants/s3paths";
import { ObjectId } from "mongodb";

interface checkUser {
  email?: string;
  _id?: mongoose.Types.ObjectId;
  deletedAt?: null | Date;
}
interface createUser {
  email: string;
  name: string;
  password: string;
  role: string;
  brandId?: mongoose.Schema.Types.ObjectId;
  location: string;
  leadSource: string;
  is_verified: boolean;
}

const createUser = async (data: createUser) => {
  const user = await User.create(data);
  return user;
};

type IUpdateUserfields = Omit<IupdateUser, "interests" | "languages"> & {
  interests: string[];
  languages: string[];
};

export const updateUser = async (id: string, data: IUpdateUserfields) => {
  try {
    return await User.updateOne({ _id: id }, data);
  } catch (err) {
    console.error(err);
  }
};

export const findAllUsers = async () => {
  return await User.find();
};

const checkUser = async (data: checkUser) => {
  return await User.findOne(data);
};

const getSanitizedUserData = async (id: unknown) => {
  const user = await User.findOne({ _id: id })
    .populate("role")
    .select("name email role");
  return user?.toJSON();
};

const getRole = async (id: string) => {
  return await Role.findOne({ _id: id });
};

 const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ email: email, deletedAt: null }).populate('role');
  return user ? user?.toJSON() : null;
};

export const getUserProifleById = async (_id: string) => {
  return await User.aggregate([
    {
      $match: { _id: new ObjectId(_id) },
    },
    {
      $project: {
        password: 0,
      },
    },
    {
      $addFields: {
        profileImageOriginal: s3GetURL(s3paths.userProfileImage + _id),
      },
    },
    {
      $lookup: {
        from: "interests",
        localField: "interests",
        foreignField: "_id",
        as: "interests",
      },
    },
    {
      $lookup: {
        from: "languages",
        localField: "languages",
        foreignField: "_id",
        as: "languages",
      },
    },
  ]);
};
const getUser = async (id: any) => {
  return await User.findOne({ _id: new mongoose.Types.ObjectId(id) });
};
export const getUserById=async(id:string)=>{
  const user= await User.findById({_id:new mongoose.Types.ObjectId(id)}).populate('role')
  return user
}
export default {
  createUser,
  checkUser,
  getSanitizedUserData,
  getRole,
  getUserByEmail,
  getUser,
};
