const SocketEventType = {
  JOIN_MASTER: 'join-master', // 교수자 Room Join
  JOIN_SLAVE: 'join-slave', // 학생 Room Join
  FORCE_KICK: 'kick', // 동시 접속 시 먼저 접속된 연결을 해제하고 알림을 보냄
  SYSTEM_MESSAGE: 'server-msg', // 시스템 메시지
  SLAVE_DISCONN: 'slave-disconnect', // 학생이 Room에 존재하지 않거나 도중에 접속이 끊긴 경우 -> 교수자도 Room에서 연결해제
  RTC_MESSAGE: 'rtc-message', // RTC Message
  REMOTE_EVENT: 'remote-event' // 원격 데스크탑 Message
};

export default SocketEventType;