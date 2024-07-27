import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface BankAccount {
  name: string;
  number: string;
  balance: number;
  logo?: string;
  bankName: string;
}

@Component({
  selector: 'app-direct-bank-transfer-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-bank-transfer-modal.component.html',
  styleUrl: './direct-bank-transfer-modal.component.scss',
})
export class DirectBankTransferModalComponent {
  bankAccounts: BankAccount[] = [];
  public Math = Math;
  public Number = Number;
  @Input() payment: any = { amount: 0.0, ref: '' };

  ngOnInit(): void {
    this.bankAccounts = [
      {
        name: 'Thames Flow Investment LTD',
        bankName: 'Momo',
        number: '0535845865',
        balance: 0.0,
        logo: '/assets/images/momo.webp',
      },
      {
        name: 'Thames Flow Investment LTD',
        bankName: 'Republic Bank',
        number: '0419946331016',
        balance: 0.0,
        logo: '/assets/images/republic-bank.webp',
      },
      
    ];
  }

  toggleTransferModal() {
    const transferModal = document.querySelector('#transferModal') as any;
    if (transferModal) {
      if (transferModal.style.display == 'block') {
        transferModal.style.display = 'none';
      } else {
        transferModal.style.display = 'block';
      }
    }
  }
}
