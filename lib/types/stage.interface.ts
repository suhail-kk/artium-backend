
export interface IStage {
    url: string,
    name: string,
    location: string,
    image: string
}


export interface IUpdateStage {
    url?: string,
    image?: string,
    name?: string,
    location?: string,
}