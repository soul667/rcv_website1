import React, { useEffect, useRef, useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const imgRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleLoad = () => {
    setStatus('loaded')
  }

  const handleError = () => {
    setStatus('error')
  }

  const handleVideoReady = () => {
    setStatus('loaded')
  }

  const { src, alt, style, className, loading, decoding, ...rest } = props

  if (status === 'error') {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    )
  }

  const isVideo = src?.toLowerCase().match(/\.(mp4|webm|mov)$/)

  useEffect(() => {
    if (!isVideo) return
    const video = videoRef.current
    if (!video) return

    const playAttempt = video.play()
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => {
        video.controls = true
        video.muted = true
        video.playsInline = true
        setStatus('loaded')
      })
    }
  }, [isVideo, src])
  
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={style}>
      {/* Skeleton pulse placeholder */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-slate-700/50 animate-pulse rounded-[inherit]" />
      )}
      {isVideo ? (
        <video
          ref={videoRef}
          src={src}
          title={alt}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          onLoadedData={handleVideoReady}
          onLoadedMetadata={handleVideoReady}
          onCanPlay={handleVideoReady}
          onError={handleError}
          {...rest as any}
        />
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading ?? 'lazy'}
          decoding={(decoding as any) ?? 'async'}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
        />
      )}
    </div>
  )
}
