import { useState, useCallback } from 'react';

/**
 * Beautiful confirm modal replacing window.confirm().
 * Usage:
 *   const { confirmModal, openConfirm } = useConfirmModal();
 *   const ok = await openConfirm({ title, message, confirmText, variant });
 */
export const useConfirmModal = () => {
  const [modal, setModal] = useState(null);

  const openConfirm = useCallback(({ title = 'Are you sure?', message = '', confirmText = 'Confirm', variant = 'danger' }) => {
    return new Promise((resolve) => {
      setModal({ title, message, confirmText, variant, resolve });
    });
  }, []);

  const handleConfirm = () => {
    modal?.resolve(true);
    setModal(null);
  };

  const handleCancel = () => {
    modal?.resolve(false);
    setModal(null);
  };

  const variantStyles = {
    danger: {
      btn: 'icon-container text-white hover:brightness-110',
      icon: 'bg-secondary-3 text-primary-4',
      iconPath: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
    },
    warning: {
      btn: 'icon-container text-white hover:brightness-110',
      icon: 'bg-secondary-3/10 text-secondary-3',
      iconPath: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
    },
    info: {
      btn: 'icon-container text-white hover:brightness-110',
      icon: 'bg-secondary-5/10 text-secondary-5',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
  };

  const ConfirmModal = modal ? (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />
      <div className="relative bg-primary-2 rounded-2xl shadow-2xl max-w-sm w-full p-6" style={{ animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className={`w-14 h-14 rounded-2xl ${variantStyles[modal.variant || 'danger'].icon} flex items-center justify-center mx-auto mb-4`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={variantStyles[modal.variant || 'danger'].iconPath} />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-primary-5 text-center mb-2">{modal.title}</h3>
        {modal.message && <p className="text-primary-4 text-center text-sm leading-relaxed mb-6">{modal.message}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-primary-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg ${variantStyles[modal.variant || 'danger'].btn}`}
          >
            {modal.confirmText}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { ConfirmModal, openConfirm };
};

export default useConfirmModal;
