export class SendMessageDto {
  username: string;
  room: string;
  text?: string;         // النص العادي
  mediaUrl?: string;     // رابط الصورة أو الوسائط
  isImage?: boolean;     // علامة إن كانت الرسالة صورة
}