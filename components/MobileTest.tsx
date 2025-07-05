'use client'

import React, { useState, useEffect } from 'react'
import { isMobile, isIOS, isAndroid, canInstallPWA } from '@/utils/device'

export default function MobileTest() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    canInstallPWA: false,
    userAgent: '',
    screenWidth: 0,
    screenHeight: 0,
    viewportWidth: 0,
    viewportHeight: 0
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo({
        isMobile: isMobile(),
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        canInstallPWA: canInstallPWA(),
        userAgent: navigator.userAgent,
        screenWidth: screen.width,
        screenHeight: screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      })
    }

    updateDeviceInfo()
    window.addEventListener('resize', updateDeviceInfo)
    return () => window.removeEventListener('resize', updateDeviceInfo)
  }, [])

  const getDeviceType = () => {
    if (deviceInfo.isIOS) return 'iOS Device'
    if (deviceInfo.isAndroid) return 'Android Device'
    if (deviceInfo.isMobile) return 'Mobile Device'
    return 'Desktop/Laptop'
  }

  const getOptimalMethod = () => {
    if (deviceInfo.isIOS) {
      return {
        method: 'PWA + Safari Share',
        description: 'Install as PWA, use Safari share button or bookmarklet',
        icon: '📱'
      }
    } else if (deviceInfo.isAndroid) {
      return {
        method: 'PWA + Chrome Share',
        description: 'Install as PWA, use Chrome share button or bookmarklet',
        icon: '🤖'
      }
    } else if (deviceInfo.isMobile) {
      return {
        method: 'Mobile Bookmarklet',
        description: 'Use mobile-optimized bookmarklet instructions',
        icon: '📱'
      }
    } else {
      return {
        method: 'Desktop Bookmarklet',
        description: 'Drag bookmarklet to bookmark bar',
        icon: '🖥️'
      }
    }
  }

  const optimal = getOptimalMethod()

  return (
    <div className="bg-gray-100 rounded-lg p-4 text-sm">
      <h3 className="font-bold mb-3">🔧 Device Detection Test</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Device Type:</span>
          <span className="font-mono">{getDeviceType()}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Screen:</span>
          <span className="font-mono">{deviceInfo.screenWidth}x{deviceInfo.screenHeight}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Viewport:</span>
          <span className="font-mono">{deviceInfo.viewportWidth}x{deviceInfo.viewportHeight}</span>
        </div>
        
        <div className="flex justify-between">
          <span>PWA Support:</span>
          <span className="font-mono">{deviceInfo.canInstallPWA ? '✅' : '❌'}</span>
        </div>
        
        <div className="border-t pt-2 mt-3">
          <div className="font-medium text-green-700">
            {optimal.icon} Recommended: {optimal.method}
          </div>
          <div className="text-green-600 text-xs mt-1">
            {optimal.description}
          </div>
        </div>
      </div>
    </div>
  )
}