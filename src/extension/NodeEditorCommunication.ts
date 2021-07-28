import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Page } from './SiteBuilderUtilities';
/**
 * 
 */

// Schemas for communications are in README.md

class CommunicationStrcut{
    command!: string;
    data?: string;
}

export function MessageHandler(message: CommunicationStrcut) {
    switch (message.command) {
        case 'vsc-ready':
            
        return;
        case 'vsc-sync':
            console.log(message.data);
            return;
    }
}