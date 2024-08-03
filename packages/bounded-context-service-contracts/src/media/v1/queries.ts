import { ImageContract } from './contracts'

export interface IMediaQueryFacade {
  getImageById(params: { imageId: string }): Promise<ImageContract>
  //searchImages(params: { query: string; limit?: number }): Promise<ImageContract[]>
  //getVideoById(params: { videoId: string }): Promise<VideoContract>
  //searchImages(params: { query: string; limit?: number }): Promise<ImageContract[]>
  //searchVideos(params: { query: string; limit?: number }): Promise<VideoContract[]>
  //getMediaById(params: { mediaId: string }): Promise<MediaContract>
  //searchMedia(params: { query: string; limit?: number }): Promise<MediaContract[]>
  // expand later possibly
}
