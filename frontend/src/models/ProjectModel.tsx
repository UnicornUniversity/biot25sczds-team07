class Project{
   _id: string;
    name: string ;
    projectOwnerId: string;
    userIds: string[];

 public constructor(_id:string,name:string, projectOwnerID:string, userIds:string[]){
   this._id = _id;
    this.name = name;
    this.projectOwnerId = projectOwnerID;
    this.userIds = userIds;
 }



}
export type ProjectIn = {
   name: string,
   projectOwner: string,
   userIds: string[],
}
export { Project };