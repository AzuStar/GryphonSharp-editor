import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Page } from './SiteBuilderUtilities';
/**
 * 
 */

class CommunicationStrcut{
    command!: string;
    data?: string;
}

export function MessageHandler(message: CommunicationStrcut) {
    console.log("new message:");
    switch (message.command) {
        case 'data-sync':
            console.log(message.data);
            return;
    }
}