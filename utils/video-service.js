const youtubedl = require('youtube-dl-exec')

/**
 * This class handles all video related operations.
 * For properties related to youtube-dl, see: https://github.com/yt-dlp/yt-dlp
 */
class VideoService {
  validateVideoURL = (videoURL) => {
    if (!videoURL) {
      throw new Error('No video URL provided!')
    } else if (!videoURL.includes('youtube.com')) {
      throw new Error(`[ ${videoURL} ] Is not a valid YouTube video!`)
    }
    return true
  }
  constructor() {
    this.validateVideoURL = this.validateVideoURL.bind(this)
  }

  /**
   * When given a video URL, this function will return the video's metadata
   * @param {string} videoURL
   * @returns {Object} Video metadata
   */
  getVideoInfoYT = async (videoURL) => {
    this.validateVideoURL(videoURL)

    return await youtubedl(videoURL, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      noWriteComments: true,
      writeSubs: false, // Write subtitle file (let's see if this works)
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    })
  }

  /**
   * Extracts the audio from a video and returns it's metadata
   * @param {string} videoURL youtube video URL
   * @returns {Object} audio file metadata
   */
  extractAudio = async (videoURL) => {
    this.validateVideoURL(videoURL)

    return await youtubedl(videoURL, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      extractAudio: true,
      format: 'm4a/bestaudio/best',
      audioQuality: 6, // 0 = best, 10 = worst
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    })
  }
}

module.exports = new VideoService()
