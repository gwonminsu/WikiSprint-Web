import { useState, useRef, useCallback } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { useUploadProfileImage, useRemoveProfileImage, cropImageToFile, checkNsfw } from '../lib';
import { useAuthStore, useToast, useTranslation } from '@shared';

// 프로필 이미지 편집 모달 Props
type ProfileImageEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl: string | null;
  // 커스텀 업로드 이미지(DB 원본값이 http가 아닌 경우) 여부 → 미리보기 표시 여부 결정
  isCustomImage: boolean;
};

// 최대 파일 크기 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// 프로필 이미지 편집 모달 컴포넌트
export function ProfileImageEditModal({
  isOpen,
  onClose,
  currentImageUrl,
  isCustomImage,
}: ProfileImageEditModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { accountInfo, setAccountInfo } = useAuthStore();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const uploadMutation = useUploadProfileImage();
  const removeMutation = useRemoveProfileImage();

  // 선택된 이미지 data URL
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // 크롭 위치
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  // 줌 값
  const [zoom, setZoom] = useState<number>(1);
  // 최종 크롭 픽셀 영역
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  // 처리 중 여부
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  // 인라인 삭제 컨펌 표시 여부 (포커스 트랩 충돌 방지를 위해 전역 Dialog 대신 사용)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 크롭 완료 콜백
  const onCropComplete = useCallback((_: Area, pixels: Area): void => {
    setCroppedAreaPixels(pixels);
  }, []);

  // 파일 선택 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 여부 검사
    if (!file.type.startsWith('image/')) {
      toastWarning(t('profile.imageOnly'));
      return;
    }
    // 파일 크기 검사
    if (file.size > MAX_FILE_SIZE) {
      toastWarning(t('profile.imageTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      setSelectedImage(ev.target?.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);

    // input 초기화 (같은 파일 재선택 허용)
    e.target.value = '';
  };

  // 이미지 적용 처리
  const handleApply = async (): Promise<void> => {
    if (!selectedImage || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      // 캔버스 크롭
      const croppedFile = await cropImageToFile(selectedImage, croppedAreaPixels);
      // NSFW 감지
      const isNsfw = await checkNsfw(croppedFile);
      if (isNsfw) {
        handleClose();
        toastWarning(t('profile.nsfwDetected'));
        return;
      }
      // 업로드
      const response = await uploadMutation.mutateAsync(croppedFile);
      // authStore 업데이트
      if (accountInfo) {
        setAccountInfo({ ...accountInfo, profile_img_url: response.profile_img_url });
      }
      toastSuccess(t('profile.updateSuccess'));
      handleClose();
    } catch {
      toastError(t('profile.updateFail'));
    } finally {
      setIsProcessing(false);
    }
  };

  // 이미지 삭제 확인 처리
  const handleRemoveConfirm = async (): Promise<void> => {
    setIsProcessing(true);
    setShowRemoveConfirm(false);
    try {
      await removeMutation.mutateAsync();
      if (accountInfo) {
        setAccountInfo({ ...accountInfo, profile_img_url: null });
      }
      toastSuccess(t('profile.removeSuccess'));
      handleClose();
    } catch {
      toastError(t('profile.removeFail'));
    } finally {
      setIsProcessing(false);
    }
  };

  // 모달 닫기 및 상태 초기화
  const handleClose = (): void => {
    setSelectedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setShowRemoveConfirm(false);
    onClose();
  };

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={(open: boolean) => { if (!open) handleClose(); }}>
      <RadixDialog.Portal>
        {/* 오버레이 */}
        <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-fade-in" />
        {/* 모달 컨텐츠 */}
        <RadixDialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onInteractOutside={(e) => e.preventDefault()}
          aria-describedby={undefined}
        >
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-scale-in">

            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <RadixDialog.Title asChild>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('profile.changeProfileImage')}
                </h2>
              </RadixDialog.Title>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                aria-label={t('common.close')}
              >
                {/* X 아이콘 */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 인라인 삭제 컨펌 (포커스 트랩 충돌 방지) */}
            {showRemoveConfirm ? (
              <div className="px-6 py-6 flex flex-col items-center gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center whitespace-pre-wrap">
                  {t('profile.removeConfirm')}
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setShowRemoveConfirm(false)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRemoveConfirm()}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? t('common.loading') : t('common.delete')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 크롭 영역 */}
                <div className="px-6 pt-5">
                  <div className="relative w-full" style={{ height: '280px', background: '#f3f4f6', borderRadius: '12px', overflow: 'hidden' }}>
                    {selectedImage ? (
                      <Cropper
                        image={selectedImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    ) : (
                      /* 이미지 미선택 플레이스홀더 */
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 dark:text-gray-500">
                        {/* 커스텀 업로드 이미지만 미리보기, 구글 기본 이미지는 제외 */}
                        {currentImageUrl && isCustomImage ? (
                          <img
                            src={currentImageUrl}
                            alt="현재 프로필"
                            className="w-32 h-32 rounded-full object-cover opacity-60"
                          />
                        ) : (
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                          </svg>
                        )}
                        {/* 커스텀 이미지 미리보기 시 문구 숨김 */}
                        {!(currentImageUrl && isCustomImage) && (
                          <p className="text-sm">{t('profile.selectImage')}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 줌 슬라이더 (이미지 선택 시만 표시) */}
                {selectedImage && (
                  <div className="px-6 pt-4">
                    <div className="flex items-center gap-3">
                      {/* 줌 아웃 아이콘 */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setZoom(Number(e.target.value))}
                        className="flex-1 accent-primary"
                        aria-label={t('profile.zoom')}
                      />
                      {/* 줌 인 아이콘 */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 하단 버튼 영역 */}
                <div className="px-6 pb-5 pt-4 flex flex-col gap-2">
                  {/* 숨겨진 파일 입력 */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* 이미지 선택 버튼 */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-green-300 hover:bg-green-50 hover:text-green-600 dark:hover:border-green-400 dark:hover:bg-green-950/20 dark:hover:text-green-400 transition-colors disabled:opacity-50"
                  >
                    {t('profile.selectImage')}
                  </button>

                  {/* 적용 버튼 (이미지 선택 시만 표시) */}
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => void handleApply()}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl bg-primary text-gray-700 dark:text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? t('common.loading') : t('profile.apply')}
                    </button>
                  )}

                  {/* 이미지 삭제 버튼 (현재 이미지가 있을 때만 표시) */}
                  {currentImageUrl && (
                    <button
                      type="button"
                      onClick={() => setShowRemoveConfirm(true)}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                    >
                      {t('profile.removeImage')}
                    </button>
                  )}
                </div>
              </>
            )}

          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
