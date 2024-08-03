import { IUnitOfWork, Story } from '@hatsuportal/domain'

export interface IUnitOfWorkFactory {
  createStoryUnitOfWork(): IUnitOfWork<Story>
  // Future unit of work types can be added here
  // createCreateCommentUnitOfWork(comment: Comment): IUnitOfWork;
  // createCreateUserUnitOfWork(user: User): IUnitOfWork;
}
