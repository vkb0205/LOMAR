import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

type AuthStatusMessageProps = {
  error: string;
  success: boolean;
};

export function AuthStatusMessage({ error, success }: AuthStatusMessageProps) {
  return (
    <>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs font-medium"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 mb-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Đăng nhập thành công! Đang chuyển hướng...
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
