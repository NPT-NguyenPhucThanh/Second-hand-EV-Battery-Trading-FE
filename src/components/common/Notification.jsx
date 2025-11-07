import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, RefreshCw, Inbox } from "lucide-react";
import { toast } from "sonner";
import { getNotification, deleteNotification } from "../../services/notificationService";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";

const getReadIdsFromStorage = () => {
  const storedIds = localStorage.getItem("readNotificationIds");
  return new Set(storedIds ? JSON.parse(storedIds) : []);
};

const saveReadIdsToStorage = (idSet) => {
  localStorage.setItem("readNotificationIds", JSON.stringify(Array.from(idSet)));
};

const timeSince = (date) => {
  if (!date) return "";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "Vừa xong";
};

function useClickOutside(refs, handler) {
  useEffect(() => {
    const listener = (event) => {
      const isClickInside = refs.some(
        (ref) => ref.current && ref.current.contains(event.target)
      );
      if (isClickInside) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs, handler]);
}

export default function TailwindNotify() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useUser();
  const [unseenCount, setUnseenCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => getReadIdsFromStorage());
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  useClickOutside([bellRef, dropdownRef], () => setIsOpen(false));

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await getNotification();
      if (res.status === 'success') {
        const newNotifications = res.notifications || [];
        setNotifications(newNotifications);
        const localReadIds = getReadIdsFromStorage();
        let newUnseenCount = 0;
        for (const notif of newNotifications) {
          if (!localReadIds.has(notif.notificationId)) newUnseenCount++;
        }
        setUnseenCount(newUnseenCount);
        setReadIds(localReadIds);
      }
    } catch (error) {
      toast.error("Không thể tải thông báo!");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await deleteNotification(id);
      if (res.status === 'success') {
        toast.success("Đã xóa thông báo.");
        const newReadIds = getReadIdsFromStorage();
        newReadIds.delete(id);
        saveReadIdsToStorage(newReadIds);
        fetchNotifications();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      toast.error("Xóa thông báo thất bại!");
    }
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnseenCount(0);
      const allCurrentIds = notifications.map(n => n.notificationId);
      const newReadIds = new Set([...readIds, ...allCurrentIds]);
      saveReadIdsToStorage(newReadIds);
      setReadIds(newReadIds);
    }
  };

  const handleNotificationClick = (link, notificationId) => {
    const selection = window.getSelection().toString();
    if (selection.length > 0) return;
    if (!readIds.has(notificationId)) {
      const newReadIds = new Set(readIds);
      newReadIds.add(notificationId);
      saveReadIdsToStorage(newReadIds);
      setReadIds(newReadIds);
    }
    if (link && link !== "#") navigate(link);
    setIsOpen(false);
  };

  return (
    <div ref={bellRef} className="relative">
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 rounded-full text-white hover:bg-white/20"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unseenCount > 0 && (
          <span className="absolute top-1 right-1 block w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full ring-2 ring-white">
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef} 
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h6 className="font-semibold text-gray-800">Thông báo</h6>
            <button
              onClick={(e) => { e.stopPropagation(); fetchNotifications(); }}
              className="text-sm text-blue-600 hover:underline p-1"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center p-10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <Inbox className="w-12 h-12 mx-auto text-gray-300" />
                <p className="mt-2 text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              <div>
                {notifications.map((item) => {
                  const isRead = readIds.has(item.notificationId);
                  return (
                    <div
                      key={item.notificationId}
                      onClick={() => handleNotificationClick(item.link, item.notificationId)}
                      className={`p-3 flex gap-3 items-start border-b border-gray-100 ${item.link ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'} ${isRead ? 'bg-white' : 'bg-blue-50'}`}
                    >
                      <div className="pt-1">
                        {!isRead ? (
                          <span className="w-2 h-2 bg-blue-500 rounded-full block"></span>
                        ) : (
                          <span className="w-2 h-2 bg-gray-300 rounded-full block"></span>
                        )}
                      </div>

                      <div className="flex-1 select-text">
                        <p className={`text-sm ${isRead ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                          {item.title}
                        </p>
                        <p 
                          className="text-sm text-gray-600"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          {item.description}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          {timeSince(item.createdTime)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDelete(item.notificationId, e)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full flex-shrink-0"
                        aria-label="Xóa thông báo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
