import { Types } from 'mongoose'

export interface IProgram {
    program_name: string;
    program_type: Types.ObjectId;
    organized_by: string;
    location: string;
    contact_info: string;
    dead_line: string;
    from_date: string;
    is_published: boolean;
    registration_status: boolean;
    to_date: string;
    notes?: string;
    image: string;
}

export interface IUpdateProgram {
    program_name: string;
    program_type: Types.ObjectId;
    organized_by: string;
    location: string;
    contact_info: string;
    dead_line: string;
    from_date: string;
    is_published: boolean;
    registration_status: boolean;
    to_date: string;
    notes?: string;
    image: string;
}

export interface IUpdateProgramStatus {
    registration_status: boolean;
}
