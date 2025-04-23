import { IWallet } from "../interfaces/IWallet";
import WalletRepository from "../repositories/walletRepository";
import { IWalletService } from "../interfaces/IServices";
import { ObjectId } from 'mongodb';


export class WalletService implements IWalletService {
    constructor (
        private _walletRepository: WalletRepository,
    ){
        this._walletRepository = _walletRepository;
    }

    async creditInstructorWallet(
        instructorId: string,
        amount: number,
        description: string,
        courseId?: string
      ): Promise<void> {
        try {
          // Validate inputs
          if (!instructorId || amount <= 0) {
            throw new Error('Invalid instructor ID or amount');
          }
    
          // Find or create the instructor's wallet
          let wallet = await this._walletRepository.findOne({ userId: new ObjectId(instructorId) });
    
          if (!wallet) {
            wallet = await this._walletRepository.create({
              userId: new ObjectId(instructorId),
              balance: 0,
              transactions: [],
            });
          }
    
          // Create a new transaction
          const transaction = {
            amount,
            type: 'credit' as 'credit',
            description,
            courseId: courseId ? new ObjectId(courseId) : undefined,
            createdAt: new Date(),
          };
    
          // Update wallet balance and add transaction
          wallet.balance += amount;
          wallet.transactions.push(transaction);
    
          // Persist changes
          await this._walletRepository.updateOne(
            { userId: new ObjectId(instructorId) },
            { balance: wallet.balance, transactions: wallet.transactions }
          );
        } catch (error: any) {
          console.error('Error in WalletService.creditInstructorWallet:', {
            error: error.message,
            instructorId,
            amount,
            courseId,
          });
          throw new Error(error.message || 'Failed to credit instructor wallet');
        }
    }

    async getWalletByUserId(userId: string): Promise<IWallet | null> {
        try {
          const wallet = await this._walletRepository.findOne({ userId: new ObjectId(userId) });
          if (!wallet) {
            return null;
          }
          wallet.transactions = wallet.transactions.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return wallet;
        } catch (error: any) {
          console.error('Error in WalletService.getWalletByUserId:', { error: error.message, userId });
          throw new Error(error.message || 'Failed to fetch wallet');
        }
      }


    
}
