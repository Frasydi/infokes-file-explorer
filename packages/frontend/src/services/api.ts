import axios, { AxiosResponse } from 'axios'
import type { 
  ApiResponse, 
  GetFoldersResponse, 
  GetSubItemsResponse,
  FileSystemItem 
} from '@/types'

const API_BASE_URL = '/api/v1'

class ApiService {
  private axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Increased to 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  })

  constructor() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('[API] Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`[API] Response ${response.status} for ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('[API] Response error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Get all folders for the tree structure
   */
  async getAllFolders(): Promise<FileSystemItem[]> {
    try {
      console.log('[API] Fetching folders from:', `${this.axiosInstance.defaults.baseURL}/folders`)
      const response: AxiosResponse<ApiResponse<GetFoldersResponse>> = 
        await this.axiosInstance.get('/folders')
      
      console.log('[API] Response received:', response.data)
      
      if (response.data.success) {
        return response.data.data.folders
      } else {
        throw new Error(response.data.message || response.data.error || 'Failed to fetch folders')
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        })
      }
      throw error
    }
  }

  /**
   * Get direct children (subfolders and files) of a specific folder
   */
  async getFolderContents(folderId: string): Promise<FileSystemItem[]> {
    try {
      const response: AxiosResponse<ApiResponse<GetSubItemsResponse>> = 
        await this.axiosInstance.get(`/folders/${folderId}/contents`)
      
      if (response.data.success) {
        return response.data.data.items
      } else {
        throw new Error(response.data.message || 'Failed to fetch folder contents')
      }
    } catch (error) {
      console.error('Error fetching folder contents:', error)
      throw error
    }
  }

  /**
   * Search for files and folders
   */
  async searchItems(query: string): Promise<FileSystemItem[]> {
    try {
      const response: AxiosResponse<ApiResponse<{ items: FileSystemItem[] }>> = 
        await this.axiosInstance.get(`/search?q=${encodeURIComponent(query)}`)
      
      if (response.data.success) {
        return response.data.data.items
      } else {
        throw new Error(response.data.message || 'Search failed')
      }
    } catch (error) {
      console.error('Error searching:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()
export default apiService
