import { IWallet } from "../interfaces/IWallet";
import WalletRepository from "../repositories/walletRepository";
import { IWalletService } from "../interfaces/IServices";
import { ObjectId } from 'mongodb';
import AdminWalletRepository from "../repositories/adminWalletRepository";


export class WalletService implements IWalletService {
    constructor (
        private _walletRepository: WalletRepository,
        private _adminWalletRepository: AdminWalletRepository
    ){
        this._walletRepository = _walletRepository;
        this._adminWalletRepository =_adminWalletRepository
    }

    async creditInstructorWallet(
        instructorId: string,
        amount: number,
        description: string,
        courseId?: string
      ): Promise<void> {
        try {
          
          if (!instructorId || amount <= 0) {
            throw new Error('Invalid instructor ID or amount');
          }
    
          
          let wallet = await this._walletRepository.findOne({ userId: new ObjectId(instructorId) });
    
          if (!wallet) {
            wallet = await this._walletRepository.create({
              userId: new ObjectId(instructorId),
              balance: 0,
              transactions: [],
            });
          }
    
          
          const transaction = {
            amount,
            type: 'credit' as 'credit',
            description,
            courseId: courseId ? new ObjectId(courseId) : undefined,
            createdAt: new Date(),
          };
    
          
          wallet.balance += amount;
          wallet.transactions.push(transaction);
    
          
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

      async creditAdminWallet(adminId: string, amount: number, description: string, courseId?: string): Promise<void> {
        try {
          let wallet = await this._adminWalletRepository.findOne({ adminId });
          if (!wallet) {
            
           wallet = await this._adminWalletRepository.create({
              adminId: new ObjectId(adminId),
              balance: amount,
              transactions: [
                {
                  amount,
                  type: 'credit',
                  description,
                  courseId: courseId ? new ObjectId(courseId) : undefined,
                  createdAt: new Date(),
                },
              ],
            });
          } else {
            
            wallet.balance += amount;
            wallet.transactions.push({
              amount,
              type: 'credit',
              description,
              courseId: courseId ? new ObjectId(courseId) : undefined,
              createdAt: new Date(),
            });
            await wallet.save();
          }
        } catch (error: any) {
          console.error('Error in WalletService.creditAdminWallet:', { error: error.message, adminId, amount });
          throw new Error('Failed to credit admin wallet');
        }
      }

      async getAdminWalletDetails(adminId: string) {
        try {
          let wallet = await this._adminWalletRepository.findOne({ adminId });
          
          if (!wallet) {
            
            return {
              balance: 0,
              transactions: [],
            };
          }
    
          
          const sortedTransactions = wallet.transactions.sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
    
          return {
            balance: wallet.balance,
            transactions: sortedTransactions,
          };
        } catch (error: any) {
          console.error('Error in getAdminWalletDetails service:', error);
          throw new Error('Failed to fetch admin wallet details');
        }
      }
    

    
}
