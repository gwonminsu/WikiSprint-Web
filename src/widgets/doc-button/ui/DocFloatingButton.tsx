import { useNavigate } from 'react-router-dom';
import { tutoDoc, useTranslation } from '@shared';

// WikiSprint 소개 페이지로 이동하는 플로팅 버튼
export function DocFloatingButton(): React.ReactElement {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = (): void => {
    navigate('/doc');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        fixed top-20 right-6 z-40
        flex items-center gap-3
        px-4 py-3
        bg-amber-400/90 hover:bg-amber-400
        rounded-2xl
        shadow-lg shadow-amber-400/30
        hover:shadow-xl hover:shadow-amber-400/40
        hover:-translate-y-1
        active:scale-[0.97]
        transition-all duration-200 ease-out
        animate-float-bounce
        cursor-pointer
      "
    >
      {/* 튜토리얼 문서 아이콘 */}
      <img
        src={tutoDoc}
        alt="tutorial"
        className="w-10 h-10 object-contain flex-shrink-0"
      />
      {/* 버튼 텍스트 */}
      <span className="text-sm font-semibold text-black whitespace-nowrap">
        {t('doc.floatingButton')}
      </span>
    </button>
  );
}
