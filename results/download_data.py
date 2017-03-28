# -*- coding: utf-8 -*-
"""
Created on Thu Jan 28 11:03:49 2016

@author: jianhongshen
"""

from sqlalchemy import create_engine, MetaData, Table
import json
import pandas as pd

p_survey = 1
db_url = "mysql://root:root@127.0.0.1:8889/turk"
table_name = 'VBET'
data_column_name = 'datastring'
survey_dict = {'jspsych-survey-text-0':'state','jspsych-survey-text-1':'email1','jspsych-survey-text-2':'email2',
                   'jspsych-survey-text-3':'YOB','jspsych-survey-radio-4':'sex','jspsych-survey-radio-5':'neuro_cond',
                   'birderOrNot':'birderOrNot','jspsych-survey-text-7':'age_intest','jspsych-survey-text-8':'age_birding',
                   'jspsych-survey-radio-9':'training','jspsych-survey-radio-10':'freq_birding','jspsych-survey-radio-11':'freq_vacation',
                   'jspsych-survey-radio-12':'self_rate','jspsych-survey-radio-13':'exp_region1','jspsych-survey-radio-14':'exp_region2',
                   'jspsych-survey-radio-15':'exp_region3','jspsych-survey-radio-16':'exp_region4','jspsych-survey-radio-17':'exp_region5',
                   'jspsych-survey-radio-18':'exp_region6','jspsych-survey-radio-19':'exp_region7','jspsych-survey-radio-20':'exp_region8',
                   'jspsych-survey-radio-21':'exp_region9','jspsych-survey-text-22':'region_other','jspsych-survey-text-23':'expert1',
                   'jspsych-survey-text-24':'expert2','jspsych-survey-text-25':'expert3','jspsych-survey-text-26':'expert4',
                   'jspsych-survey-text-27':'expert5','jspsych-survey-text-28':'eBirdID','uniqueid':'uniqueid'}

# boilerplace sqlalchemy setup
engine = create_engine(db_url)
metadata = MetaData()
metadata.bind = engine
table = Table(table_name, metadata, autoload=True)
# make a query and loop through
s = table.select()
rows = s.execute()

data = []
#status codes of subjects who completed experiment
statuses = [3,4,5,7]
# if you have workers you wish to exclude, add them here
exclude = []
for row in rows:
    # only use subjects who completed experiment and aren't excluded
    if row['status'] in statuses and row['uniqueid'] not in exclude:
        data.append(row[data_column_name])

# Now we have all participant datastrings in a list.
# Let's make it a bit easier to work with:

# parse each participant's datastring as json object
# and take the 'data' sub-object
data = [json.loads(part)['data'] for part in data]

# insert uniqueid field into trialdata in case it wasn't added
# in experiment:
for part in data:
    for record in part:
        record['trialdata']['uniqueid'] = record['uniqueid']
    part[p_survey]['trialdata']['responses'] = json.loads(part[p_survey]['trialdata']['responses'])    
    part[p_survey]['trialdata']['responses']['uniqueid'] = record['uniqueid']

# flatten nested list so we just have a list of the trialdata recorded
# each time psiturk.recordTrialData(trialdata) was called.
survey_data = [part[p_survey]['trialdata']['responses'] for part in data]
test_data = [record['trialdata'] for part in data for record in part if record['trialdata']['trial_type']=="single-stim"]

# Put all subjects' trial data into a dataframe object from the
# 'pandas' python library: one option among many for analysis
survey_data = pd.DataFrame(survey_data)
survey_col_names = [survey_dict[k] for k in survey_data.columns.values.tolist()]
survey_data.columns = survey_col_names

test_data = pd.DataFrame(test_data)

# output rt, accuracy, and survey data
n_item = len(test_data)/len(survey_data)
subs = survey_data.uniqueid
items = ['item' + str(i) for i in range(1,(n_item+1))]
#rt = acc = trial = pd.DataFrame(index=subs, columns=items)
#for j in range(len(subs)):
#    p_j = subs[j]
#    for i in range(n_item):
#        i_i = items[i]
#        nrow = n_item*j + i
#        trial.loc[p_j,i_i] = test_data['trial_index'][nrow]
#        rt[i_i][p_j] = test_data['rt'][nrow]
#        acc[i_i][p_j] = int( test_data['answer'][nrow] == (test_data['key_press'][nrow]-48) )

test_data.to_csv("/Users/jianhongshen/Documents/Turk/VBET/results/test_data.csv")
survey_data.to_csv("/Users/jianhongshen/Documents/Turk/VBET/results/survey_data.csv")
