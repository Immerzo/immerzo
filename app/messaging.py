import smtplib
import threading

from email.mime.text import MIMEText


SERVER_NAME = "smtp.gmail.com"
PORT = 465

SENDER = "notification@immerzo.io"
SENDER_NAME = "<Immerzo notification> notification@immerzo.io"
PASSWORD = "dsjr covr oibf slxr"


SUBJECT= "Immerzo message notification"
BODY = "Dear creator,\n\nYou have received a new chat message on Immerzo. Please log in at https://app.immerzo.io to view the message under the Conversations tab.\n\nYou will find the message by selecting the Brand who sent it, or the Project.\n\nSincerely,\nThe Immerzo team"


def notify(username):

    msg = MIMEText(BODY)
    msg['Subject'] = SUBJECT
    msg['From'] = SENDER_NAME
    msg['To'] = username 

    threading.Thread(target=send_notification, args=(username, msg)).start()


def send_notification(username, msg):
    with smtplib.SMTP_SSL(SERVER_NAME, PORT) as smtp_server:
        smtp_server.login(SENDER, PASSWORD)
        smtp_server.sendmail(SENDER, username, msg.as_string())

