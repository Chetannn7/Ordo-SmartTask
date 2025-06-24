import { CheckCheck } from "lucide-react";

export function LoadingRedirect({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg mb-6">
            <CheckCheck className="text-white text-3xl" />
          </div>
          {/* Animated loading ring */}
          <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-gray-700 mt-4">{message}</p>
      </div>
    </div>
  );
}