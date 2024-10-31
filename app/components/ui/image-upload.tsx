"use client"

import * as React from "react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface ImageUploadProps {
  className?: string
  value?: string
  onChange?: (value: string) => void
  onRemove?: () => void
  disabled?: boolean
}

export function ImageUpload({
  className,
  value,
  onChange,
  onRemove,
  disabled
}: ImageUploadProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsLoading(true)
      const file = acceptedFiles[0]

      if (file) {
        // Convert file to base64 or upload to your storage service
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            onChange?.(reader.result)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onChange])

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    disabled: disabled || isLoading,
    onDrop
  })

  if (!isMounted) {
    return null
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {value ? (
        <div className="relative w-40 h-40">
          <Image
            fill
            alt="Upload"
            src={value}
            className="object-cover rounded-full"
          />
          {!disabled && (
            <button
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              type="button"
            >
              <Icons.trash className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-gray-400 transition cursor-pointer"
        >
          <input {...getInputProps()} />
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Icons.spinner className="h-4 w-4 animate-spin" />
              <p>Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Icons.upload className="h-8 w-8 text-gray-500" />
              <p>Drag & drop or click to upload</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 