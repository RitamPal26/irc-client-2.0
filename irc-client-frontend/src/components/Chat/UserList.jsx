const UserList = ({ channel }) => {
  const onlineMembers = channel?.members?.filter(member => member.user?.isOnline) || [];
  const offlineMembers = channel?.members?.filter(member => !member.user?.isOnline) || [];

  return (
    <div className="h-full p-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3">
        Members ({channel?.members?.length || 0})
      </h3>
      
      <div className="space-y-4">
        {/* Online Members */}
        {onlineMembers.length > 0 && (
          <div>
            <h4 className="text-xs text-green-400 mb-2">Online - {onlineMembers.length}</h4>
            <div className="space-y-1">
              {onlineMembers.map((member) => (
                <div key={member.user._id} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm">{member.user.username}</span>
                  {member.role === 'admin' && (
                    <span className="text-xs text-yellow-400">👑</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
          <div>
            <h4 className="text-xs text-gray-500 mb-2">Offline - {offlineMembers.length}</h4>
            <div className="space-y-1">
              {offlineMembers.map((member) => (
                <div key={member.user._id} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-sm text-gray-400">{member.user.username}</span>
                  {member.role === 'admin' && (
                    <span className="text-xs text-yellow-400">👑</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
