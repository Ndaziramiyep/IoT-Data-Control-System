//
//  MTDeviceInfoData.h
//  MTSensorV3Kit
//
//  Created by minew on 2021/8/5.
//  Copyright © 2021 Minewtech. All rights reserved.
//

#import <Foundation/Foundation.h>

@class MTIHTSensorWarmingSettingModel;

@interface MTIHTSensorConfigParm : NSObject

@property (nonatomic, strong) NSArray<MTIHTSensorWarmingSettingModel *> *MTIHTSensorWarmingSettingModels;

@property (nonatomic, assign) NSInteger samplingInterval;

@end

