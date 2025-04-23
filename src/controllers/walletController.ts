import { Request, Response } from "express";
import { WalletService } from "../services/walletService";
import { Status } from "../utils/enums";
import { AuthRequest } from "../middleware/authMiddleware";

class WalletController {
  constructor(
    private readonly _walletService: WalletService
) {}

  async getWalletDetails(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: User ID not found',
        });
      }

      const wallet = await this._walletService.getWalletByUserId(req.user.id);
      if (!wallet) {
        return res.status(Status.OK).json({
          success: true,
          message: 'No wallet found',
          data: { balance: 0, transactions: [] },
        });
      }

      return res.status(Status.OK).json({
        success: true,
        message: 'Wallet details fetched successfully',
        data: {
          balance: wallet.balance,
          transactions: wallet.transactions,
        },
      });
    } catch (error: any) {
      console.error('Error in WalletController.getWalletDetails:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch wallet details',
        data: { balance: 0, transactions: [] },
      });
    }
  }
}

export default WalletController;