import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';


interface BankAccount {
  name: string;
  number: string;
  balance: number;
  logo?:string;
}

@Component({
  selector: 'app-direct-bank-transfer-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-bank-transfer-modal.component.html',
  styleUrl: './direct-bank-transfer-modal.component.scss'
})
export class DirectBankTransferModalComponent {
  bankAccounts: BankAccount[] = [];
  @Input() payment:any = {amount:0.00, ref:""}

  ngOnInit(): void {
    this.bankAccounts = [
      { name: 'Efielounge Foods', number: '1234567890', balance: 1000.50, logo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAHMBXgMBIgACEQEDEQH/xAAbAAEAAwEBAQEAAAAAAAAAAAAABAUGAwIBB//aAAgBAQAAAADSkeDGfZU7sFd4+EmYAAABXQQLGcMBzCdq5QAAAgV77M68ofxZzDAeHr1y+9tt2AAAeKT51t/Zzp/Hq79MBz19ogZDnfaRxoKvlJvfVde4xrLEylbZafg79AjVK0lsB411oZygm7Xhi+ALHY4yBaa5Gw3za4s3EoPlF8n2DAc9faFFmpe3yFZ20UmroljsanJtzJzNHN2v52buSCh+T7BgPGutHjGQ7fTYL5tZxlqax2PzC8L3Q4TxqbnlydugR6haS2A8T+/mBybRi36EKjKWOxUGc93+d6bz1zpHa39HOo5/bz0wHgPuoueGDbWcZqisdi5YTyX+jK+A9TOnKH8WU0wHi0lutrJMbXydRIqM6sNkZelN1IFbCAn2AwHjXWgEXGcgWGyIeIWuuBGg8PPuRO7hgeevswEfOVfOV1gWOyIuHbCyAPj6AAAfPvz59+mXpZW4AAAAAAHPB+dNeAAAAAACryHz9B9j/8QAGQEBAAMBAQAAAAAAAAAAAAAAAAECAwQF/9oACgICEAMQAAAAJ5J41Y3jvXu0FWQAAAnlnhjuaTxqV9XVozXQwWXVQkUWWWrSKXFbeRHqaa2YLt3O6JpF0MW7lbqprRSwrbyK+prrdmuIGKzdzOlm1cxyzwx3ruOaV9XVqqhi0XYNGjmaN5zjATyTxqt696+qzABu0QhzJdU80VAAAAAAaNXMAAAAAAN0MR//xAA+EAACAQEFAwoBCwMFAQAAAAABAgMEAAUQETEgUXESExQiMjM0QXKSIRUwNUBCQ1JTYXOiUIGRIyRUY4Kx/9oACAEBAAE/AMZamOL4atuFnq5W0yUWJJOZOZwVmQ5qSDZKyRe0AwtHPHLofjuO017UCkgyN7Db5YoPxv7LfLNDvk9tvlmh3ye2wvmh3v7bR3hRS5BKheB6v1qoqs80jPw8229LU9VyiEk18jsy97J622qWvqaQgI2afga1JWQ1cfKj1GqnUfV6ub7tT6sUR3OSqSbLRMe24HC3QY/xtZ6Jx2HzsyshyYEHGln5Y5DHrDYl72T1tgPjoDYRyHSN/abczMBmYpMvScYJ5KaVZYzkRaCZKiFJU0YfVXcIjOfIWJLEk6k4QwmZ8tANTZEWNeSoyGxJEsq5MLSRtE5U4I5jdXHkbKQwBGhxl72T1thc3gE9b41d3wVSnNQsnk4tLE8EjxyDJlOFxz5PLAfWMZp4oELyuFW09+SaU8YX9WtJW1kvbqJLc9N+a/uNoryrYdJ2I3P1rUl8QTZJMBE/8bVd708Gaxf6r2oa2pqbwi5yQ6N1bVqSSUkyxkh+TmMrdIn/AD5PcbdIn/Pk9xtdlUaqmBc5yJ1X2L0rZHqnSOVgkdukVH58nuNqCKrrTJ/u5kVLSRLKvJbPK3Qof1t0KH9bRxpEvJXaqow8RPmuNG2cOW4kYy97J62wubwCet9i/YQDBNxQ4XYxWvpvXlhU1EdLC0snADebVNTLVSmSU8B5Dbunx8PB8LypujVbgDJH664XRUcxVhDpL1caycU1NLL5gZL6jjd1P0akjU9o9Z7ZnebZnebZnebUPgqX9pdsjIkbicKE94OGMveyetsLm8AnrfYv5wIqdN7FsLvGddS/uDC9qnn6ooD1IuqMKemmqpOREuZ8z5C0NyUy98WkNjdVAfuLVdysgL05L70xunx8PB8L5p+dpecGsWHxHxByNqScVNNFL5kfHiML8nzlSAaIM2wu6n6TVxr9leu2GY32zG+2Y32ovBUn7KbbHNmO8nCh+8/tjL3snrbC5vAJ63xkkSJGeRgqjUm1dVmsqDJouiDC5IuXVmTyjS08nNQSyfgQnG76UU1Kg+2wzfYvmlEUyzJpLhdPj4eDYEBgQRmCCCLVMBpp5IT9k4XHUZSSQHR+stpZFhjeR9EUk2kkaWR5H7TMScLlg5unMx1lwdo415TAAcLdJpt/8bdJpt/8bRyJIuaH4bVTKI4jvb4DGjXKHPeScZe9k9bYU95VVNGI4ymX6iwvqt/6vbY3zX+ToOC2mnnnOcsrPxOABJAAJJOQFrvpOiU4Q9s9Z7Xl4Cp9GAyzGemY2b78EP3RhdP0hDwbG/IMxHUD0PhFI0MiSJqjAi171iPTwRxnvQHOEMTTzRxLq7ZWRVRVVRkFAAwkQSIy7xYggkHUYQTGF89QdRZHV1BU5jYkkSNc2NpZWlflH+wwVS7BRqTZVCqFGgGMveyettpVZ2CIpZjoBa7bs6PlNN3v/wAwqY+dpp4/NoyBjd1SKmkjOfXXqvsX3Uh3SnX7HxfC6fHw8GxniWeGSJtHXKzo0bsjjJlJB4jYuOnzMlQfQuxVwfeL/wCsUkeM5q2VkrT9tP8AFumx/haz1rHsIBZmZzmxzONJDyBy21OmxL3snrbCjup6uESiYLb5BP8Ayv4W+QX86keyyXFF9udzaCkp6YZRRgbF50vRqpsh1H6yYUtXLSS8uPgynQ2gvWimAzk5s7ns1bRoMzVRe61XfS5FKX3mxJJzJwun6Rpti+qfkTrMNJcciSABmToLUsApqeKH8I2Z6Urm0YzG75inpdHkHBdmXvZPW2Fz+AT1v8xWUqVcJjbirbjaeCWnkMcq5MNu6fpGm2K+m6TSyIO1qnEY3RBz1WHOkXW25aWOT49lt4s9LMmg5XCxVl1UjiLZ2CO3ZRj/AGslHK3ayW0VPHFoMzvO1MrCWTqt228rZHcf8Wuf6Pi9T/M1FNDVR8iVOB8xaouapizMWUq2eOSM5PG68QRbMWho6qfu4H4kZC1ZQvRJCZHBL2zG+10/SNPsV1R0alll89E9Rxuqn5ikXMdaTrn5rIfVwoGgGBAOtuQv4RYADQAbF9VHLnEA0iwoafpVVFF5avwH9JmlWGKSVtEUmzuzuzsc2YknicLjg5ELznWT+k3z4B/WmDaWjVUjRVGQCgAbP//EACURAAICAQIGAwEBAAAAAAAAAAECABEDEDESEyAyQWEhUXFAMP/aAAgBAgEBPwCV1Ioa5y19zlr7hxfR/wBBpcvoxbmM3CJzfUVw0yLYvQKW2nKP3CjCBDRMVOLzGQqNFUsYcdCy05XuOnD56sW5mXt0TuEbYxF4jPgD1OasDBto3afyIaaEWCNMYofsynxOb6jNxeOrFuY6lhOW0ROGZGoVMWxmU7aIaYRu06KbAjrbj3NhCbJMGldOLcwkDecxfuHKPEJJNmYjuI68QlH6iIbsxu0/mmM0a0yGhWt63ri3MybdK5Ad9OJbq43adBditHNt/JjHzcc0v8uLtmXxr//EACMRAAICAQMEAwEAAAAAAAAAAAECAAMxBBEhEDJAQRJCUJH/2gAIAQMBAT8Alup24T+xnZ+5iYImodc8iI6uNx4OpsKqFGTFBYgDJiaVB3cmHT1H6y2k185EqsNbg+vfgtWjHcqDBWincKB1ZQylT7mDKTvUngF1XLAQOjHYMD1Zgqkn1DyZQNqk8DU1/JfkMiKxUgjIialD3cGG+ofaXXGzjCyqs2OB4Vum35SMjrlSIATgRNPY2RsIiLWNh+7/AP/Z" },
      { name: 'Efielounge Foods 2', number: '9876543210', balance: 5000.25, logo: "https://th.bing.com/th/id/OIP.jCLIbne8iQljVqvdezyrMQAAAA?rs=1&pid=ImgDetMain" },
      { name: 'Efielounge Foods', number: '0123456789', balance: 234.78, logo: "https://imgs.search.brave.com/Onl_0bD_X6C0aIAmTlzOmuuZgmYkwci2__IgG_0uCtI/rs:fit:500:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy8x/LzE0L0dUQmFua19s/b2dvLnN2Zw.svg" },
    ];
  }

  toggleTransferModal() {
    const transferModal = document.querySelector(
      '#transferModal'
    ) as any;
    if (transferModal) {
      if (transferModal.style.display == 'block') {
        transferModal.style.display = 'none';
      } else {
        transferModal.style.display = 'block';
      }
    }
  }
}
