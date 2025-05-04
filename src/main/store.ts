import fs from 'fs'
import path from 'path'
import { app as electronApp } from 'electron'

// Create a simple in-memory store for persistent data
export class SimpleStore {
  private data: Record<string, any>
  private filePath: string

  constructor(options: { name: string; defaults: Record<string, any> }) {
    this.data = { ...options.defaults }

    // Try to load data from file if it exists
    const userDataPath = electronApp.getPath('userData')
    this.filePath = path.join(userDataPath, `${options.name}.json`)

    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(fileContent)
      }
    } catch (error) {
      console.error('Error loading store file:', error)
    }
  }

  get(key?: string): any {
    if (key) {
      return this.data[key]
    }
    return this.data
  }

  set(key: string | Record<string, any>, value?: any): void {
    if (typeof key === 'string') {
      this.data[key] = value
    } else {
      this.data = { ...this.data, ...key }
    }

    // Save data to file
    this.save()
  }

  save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (error) {
      console.error('Error saving store file:', error)
    }
  }
} 