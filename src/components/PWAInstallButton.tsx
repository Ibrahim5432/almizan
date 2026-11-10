import React, { useEffect, useState } from 'react';
import { Download, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowGuideModal(true);
          }
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-[#E2DACB] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#B8892B] transition-colors whitespace-nowrap shrink-0"
        aria-label="تثبيت تطبيق ميزان الخبر"
      >
        <Download className="w-3.5 h-3.5 text-[#B8892B]" />
        <span>تثبيت التطبيق</span>
      </button>

      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="تثبيت تطبيق ميزان الخبر"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-md border border-[#E2DACB] dark:border-slate-700 bg-[#FAF7F2] dark:bg-[#111C33] p-6 shadow-xl">
            <h3 className="text-base font-bold font-display text-[#0B1220] dark:text-[#F3EFE6]">
              تثبيت «ميزان الخبر» كتطبيق ويب (PWA)
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isIOS
                ? 'لتثبيت التطبيق على iPhone أو iPad: اضغط على زر المشاركة (Share) في شريط متصفح Safari ثم اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).'
                : 'لتثبيت المنصة للوصول السريع والقراءة دون اتصال: اضغط على أيقونة التثبيت في شريط عنوان المتصفح أو من قائمة المتصفح اختر «تثبيت التطبيق».'}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#0B1220] text-[#FAF7F2] dark:bg-[#B8892B] dark:text-[#0B1220]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 start-4 z-50 flex items-center gap-2 bg-[#0B1220] text-[#FAF7F2] border border-[#B8892B] px-3 py-2 text-xs font-medium shadow-lg"
    >
      <WifiOff className="w-4 h-4 text-[#B8892B]" />
      <span>وضع القراءة دون اتصال — يتم عرض النسخة المخزنة محليًا</span>
    </div>
  );
};
