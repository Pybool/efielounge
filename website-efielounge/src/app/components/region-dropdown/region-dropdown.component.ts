import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { notableAreas } from '../../services/regions.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-region-dropdown',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './region-dropdown.component.html',
  styleUrl: './region-dropdown.component.scss'
})
export class RegionDropdownComponent implements OnInit {
  items: string[] = notableAreas;
  @Output() selectionChanged = new EventEmitter<string>();

  searchTerm: string = '';
  filteredItems: string[] = [];
  show:boolean = false;

  ngOnInit(): void {
    this.filteredItems = this.items; // Initialize with all items
  }

  filterItems(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter(item =>
        item.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if(!this.show){
      this.showDropdownMenu()
    }
  }

  selectItem(item: string): void {
    this.selectionChanged.emit(item);
    this.searchTerm = item;
    this.filteredItems = []; // Optionally, close the dropdown
  }

  showDropdownMenu(){
    this.show = !this.show
  }

  clearInput(){
    this.searchTerm = ""
    this.selectionChanged.emit(this.searchTerm);
  }
}