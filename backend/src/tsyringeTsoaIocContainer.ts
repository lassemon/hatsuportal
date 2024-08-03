import { IocContainer, IocContainerFactory } from '@tsoa/runtime'
import { container as tsyringeContainer } from 'tsyringe'
import express from 'express'

export const iocContainer: IocContainerFactory = function (request: express.Request): IocContainer {
  return {
    get: <T>(controller: { prototype: T }): T => {
      return tsyringeContainer.resolve<T>(controller as never)
    }
  }
}
